import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTank, useSubscription, useAquaMode, useAuth } from '@/context';
import { LoadingState } from '@/components';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { LivestockItem } from '@shared/types';
import Toast from 'react-native-toast-message';

const LIVESTOCK_TYPES = [
  { value: 'fish', label: 'Fish', icon: '🐠' },
  { value: 'coral', label: 'Coral', icon: '🪸' },
  { value: 'invert', label: 'Invertebrate', icon: '🦐' },
  { value: 'plant', label: 'Plant', icon: '🌿' },
];

const STATUS_OPTIONS = ['healthy', 'sick', 'quarantine', 'deceased'];

export default function LivestockScreen() {
  const { user } = useAuth();
  const { currentTank } = useTank();
  const { features } = useSubscription();
  const { theme } = useAquaMode();
  
  const [livestock, setLivestock] = useState<LivestockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<LivestockItem | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    type: 'fish',
    status: 'healthy',
    cost: '',
    source: '',
    notes: '',
  });

  const loadLivestock = useCallback(async () => {
    if (!currentTank) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('tank_id', currentTank.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLivestock(data || []);
    } catch (error) {
      console.error('Error loading livestock:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentTank]);

  useEffect(() => {
    loadLivestock();
  }, [loadLivestock]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLivestock();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      species: '',
      type: 'fish',
      status: 'healthy',
      cost: '',
      source: '',
      notes: '',
    });
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: LivestockItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      species: item.species || '',
      type: item.type || 'fish',
      status: item.status || 'healthy',
      cost: item.cost?.toString() || '',
      source: item.source || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Toast.show({ type: 'error', text1: 'Name is required' });
      return;
    }
    if (!currentTank || !user) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        species: formData.species.trim() || null,
        type: formData.type,
        status: formData.status,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        source: formData.source.trim() || null,
        notes: formData.notes.trim() || null,
        tank_id: currentTank.id,
        user_id: user.id,
        date_added: new Date().toISOString().split('T')[0],
      };

      if (editingItem) {
        const { error } = await supabase
          .from('livestock')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        Toast.show({ type: 'success', text1: 'Livestock updated!' });
      } else {
        const { error } = await supabase
          .from('livestock')
          .insert(payload);
        if (error) throw error;
        Toast.show({ type: 'success', text1: 'Livestock added!' });
      }

      setShowModal(false);
      resetForm();
      loadLivestock();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: LivestockItem) => {
    Alert.alert(
      'Delete Livestock',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('livestock')
                .delete()
                .eq('id', item.id);
              if (error) throw error;
              Toast.show({ type: 'success', text1: 'Livestock deleted' });
              loadLivestock();
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message });
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    const found = LIVESTOCK_TYPES.find(t => t.value === type);
    return found?.icon || '🐟';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#22c55e';
      case 'sick': return '#ef4444';
      case 'quarantine': return '#f59e0b';
      case 'deceased': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const isReefMode = currentTank?.type !== 'freshwater';

  if (!features.livestock) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.5} />
        <Stack.Screen options={{ title: 'Livestock', headerShown: true }} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-slate-800 mb-2">Super Premium Feature</Text>
          <Text className="text-slate-500 text-center mb-6">
            Upgrade to Super Premium to track your livestock
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/subscription')}
            className="rounded-xl py-3 px-6"
            style={{ backgroundColor: theme.accentPrimary }}
          >
            <Text className="text-white font-bold">Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      <Stack.Screen options={{ title: 'Livestock', headerShown: true }} />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accentPrimary} />
        }
      >
        {isLoading ? (
          <LoadingState message="Loading livestock..." />
        ) : livestock.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🐠</Text>
            <Text className="text-xl font-bold text-slate-800 mb-2">No Livestock</Text>
            <Text className="text-slate-500 text-center mb-6">
              Add your fish, corals, and invertebrates
            </Text>
            <TouchableOpacity
              onPress={openAddModal}
              className="rounded-xl py-3 px-6"
              style={{ backgroundColor: theme.accentPrimary }}
            >
              <Text className="text-white font-bold">Add First Livestock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            {livestock.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openEditModal(item)}
                onLongPress={() => handleDelete(item)}
                className="bg-white rounded-xl p-4 border border-aqua-200"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{getTypeIcon(item.type)}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-800">{item.name}</Text>
                    {item.species && <Text className="text-slate-500 text-sm">{item.species}</Text>}
                    <View className="flex-row items-center mt-1">
                      <View 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: getStatusColor(item.status) }} 
                      />
                      <Text className="text-slate-400 text-sm capitalize">{item.status}</Text>
                      {item.cost && <Text className="text-slate-400 text-sm ml-2">• ${item.cost}</Text>}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {livestock.length > 0 && (
        <TouchableOpacity
          onPress={openAddModal}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: theme.accentPrimary }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-aqua-100">
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text className="text-slate-500">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Livestock' : 'Add Livestock'}
            </Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={theme.accentPrimary} />
              ) : (
                <Text style={{ color: theme.accentPrimary, fontWeight: '600' }}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Name *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(v) => setFormData({...formData, name: v})}
                placeholder="e.g., Nemo"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Species */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Species</Text>
              <TextInput
                value={formData.species}
                onChangeText={(v) => setFormData({...formData, species: v})}
                placeholder="e.g., Ocellaris Clownfish"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Type */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Type</Text>
              <View className="flex-row flex-wrap gap-2">
                {LIVESTOCK_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setFormData({...formData, type: type.value})}
                    className="flex-row items-center px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: formData.type === type.value ? theme.accentPrimary : 'white',
                      borderColor: formData.type === type.value ? theme.accentPrimary : '#e2e8f0',
                    }}
                  >
                    <Text className="mr-1">{type.icon}</Text>
                    <Text style={{ color: formData.type === type.value ? 'white' : '#475569' }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Status</Text>
              <View className="flex-row flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setFormData({...formData, status})}
                    className="px-4 py-2 rounded-full border"
                    style={{
                      backgroundColor: formData.status === status ? getStatusColor(status) : 'white',
                      borderColor: formData.status === status ? getStatusColor(status) : '#e2e8f0',
                    }}
                  >
                    <Text 
                      className="capitalize"
                      style={{ color: formData.status === status ? 'white' : '#475569' }}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cost */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Cost ($)</Text>
              <TextInput
                value={formData.cost}
                onChangeText={(v) => setFormData({...formData, cost: v})}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Source */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Source</Text>
              <TextInput
                value={formData.source}
                onChangeText={(v) => setFormData({...formData, source: v})}
                placeholder="e.g., Local Fish Store"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Notes</Text>
              <TextInput
                value={formData.notes}
                onChangeText={(v) => setFormData({...formData, notes: v})}
                placeholder="Any additional notes..."
                multiline
                numberOfLines={3}
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
                style={{ minHeight: 80, textAlignVertical: 'top' }}
              />
            </View>

            {/* Delete Button (only for editing) */}
            {editingItem && (
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  handleDelete(editingItem);
                }}
                className="mt-4 py-3 rounded-xl border border-red-300 bg-red-50"
              >
                <Text className="text-red-600 font-semibold text-center">Delete Livestock</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
