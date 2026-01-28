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
import { EquipmentItem } from '@shared/types';
import Toast from 'react-native-toast-message';

const EQUIPMENT_CATEGORIES = [
  { value: 'filtration', label: 'Filtration', icon: '🔄' },
  { value: 'lighting', label: 'Lighting', icon: '💡' },
  { value: 'heating', label: 'Heating', icon: '🌡️' },
  { value: 'circulation', label: 'Circulation', icon: '🌊' },
  { value: 'skimmer', label: 'Skimmer', icon: '🫧' },
  { value: 'dosing', label: 'Dosing', icon: '💧' },
  { value: 'testing', label: 'Testing', icon: '🧪' },
  { value: 'other', label: 'Other', icon: '🔧' },
];

export default function EquipmentScreen() {
  const { user } = useAuth();
  const { currentTank } = useTank();
  const { features } = useSubscription();
  const { theme } = useAquaMode();
  
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'filtration',
    brand: '',
    model: '',
    cost: '',
    purchase_date: '',
    warranty_until: '',
    notes: '',
  });

  const loadEquipment = useCallback(async () => {
    if (!currentTank) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('tank_id', currentTank.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentTank]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEquipment();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'filtration',
      brand: '',
      model: '',
      cost: '',
      purchase_date: '',
      warranty_until: '',
      notes: '',
    });
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: EquipmentItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'filtration',
      brand: item.brand || '',
      model: item.model || '',
      cost: item.cost?.toString() || '',
      purchase_date: item.purchase_date || '',
      warranty_until: item.warranty_until || '',
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
        category: formData.category,
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        purchase_date: formData.purchase_date || null,
        warranty_until: formData.warranty_until || null,
        notes: formData.notes.trim() || null,
        tank_id: currentTank.id,
        user_id: user.id,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('equipment')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        Toast.show({ type: 'success', text1: 'Equipment updated!' });
      } else {
        const { error } = await supabase
          .from('equipment')
          .insert(payload);
        if (error) throw error;
        Toast.show({ type: 'success', text1: 'Equipment added!' });
      }

      setShowModal(false);
      resetForm();
      loadEquipment();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: EquipmentItem) => {
    Alert.alert(
      'Delete Equipment',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('equipment')
                .delete()
                .eq('id', item.id);
              if (error) throw error;
              Toast.show({ type: 'success', text1: 'Equipment deleted' });
              loadEquipment();
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message });
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: string) => {
    const found = EQUIPMENT_CATEGORIES.find(c => c.value === category);
    return found?.icon || '🔧';
  };

  const isReefMode = currentTank?.type !== 'freshwater';

  if (!features.equipment) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.5} />
        <Stack.Screen options={{ title: 'Equipment', headerShown: true }} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-slate-800 mb-2">Super Premium Feature</Text>
          <Text className="text-slate-500 text-center mb-6">
            Upgrade to Super Premium to track your equipment
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
      <Stack.Screen options={{ title: 'Equipment', headerShown: true }} />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accentPrimary} />
        }
      >
        {isLoading ? (
          <LoadingState message="Loading equipment..." />
        ) : equipment.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🛠️</Text>
            <Text className="text-xl font-bold text-slate-800 mb-2">No Equipment</Text>
            <Text className="text-slate-500 text-center mb-6">
              Add your pumps, lights, skimmers and more
            </Text>
            <TouchableOpacity
              onPress={openAddModal}
              className="rounded-xl py-3 px-6"
              style={{ backgroundColor: theme.accentPrimary }}
            >
              <Text className="text-white font-bold">Add First Equipment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3">
            {equipment.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openEditModal(item)}
                onLongPress={() => handleDelete(item)}
                className="bg-white rounded-xl p-4 border border-aqua-200"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{getCategoryIcon(item.category)}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-800">{item.name}</Text>
                    <Text className="text-slate-500 text-sm capitalize">{item.category}</Text>
                    {item.brand && (
                      <Text className="text-slate-400 text-sm">
                        {item.brand}{item.model ? ` - ${item.model}` : ''}
                      </Text>
                    )}
                    {item.cost && <Text className="text-slate-400 text-sm">${item.cost}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {equipment.length > 0 && (
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
              {editingItem ? 'Edit Equipment' : 'Add Equipment'}
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
                placeholder="e.g., Return Pump"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Category */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setFormData({...formData, category: cat.value})}
                      className="flex-row items-center px-4 py-2 rounded-full border"
                      style={{
                        backgroundColor: formData.category === cat.value ? theme.accentPrimary : 'white',
                        borderColor: formData.category === cat.value ? theme.accentPrimary : '#e2e8f0',
                      }}
                    >
                      <Text className="mr-1">{cat.icon}</Text>
                      <Text style={{ color: formData.category === cat.value ? 'white' : '#475569' }}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Brand */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Brand</Text>
              <TextInput
                value={formData.brand}
                onChangeText={(v) => setFormData({...formData, brand: v})}
                placeholder="e.g., EcoTech"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Model */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-2">Model</Text>
              <TextInput
                value={formData.model}
                onChangeText={(v) => setFormData({...formData, model: v})}
                placeholder="e.g., Vectra L2"
                className="bg-white border border-aqua-200 rounded-xl px-4 py-3"
                placeholderTextColor="#94a3b8"
              />
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
                <Text className="text-red-600 font-semibold text-center">Delete Equipment</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
