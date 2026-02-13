import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTank, useAuth, useAquaMode } from '@/context';
import { LoadingState, EmptyState, CreateAccountPrompt } from '@/components';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { MaintenanceEntry } from '@shared/types';
import { MAINTENANCE_TYPES } from '@/constants';
import { DEMO_MAINTENANCE } from '@/constants/demoData';
import Toast from 'react-native-toast-message';

export default function MaintenanceScreen() {
  const { user, isGuestMode } = useAuth();
  const { currentTank } = useTank();
  const { theme } = useAquaMode();
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'water_change',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMaintenance = useCallback(async () => {
    if (!currentTank) {
      setIsLoading(false);
      return;
    }

    // Guest mode: use demo data
    if (isGuestMode) {
      setEntries(DEMO_MAINTENANCE);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select('*')
        .eq('tank_id', currentTank.id)
        .order('due_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading maintenance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTank]);

  useEffect(() => {
    loadMaintenance();
  }, [loadMaintenance]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadMaintenance();
    setIsRefreshing(false);
  };

  const handleAddEntry = async () => {
    if (isGuestMode) {
      setShowAddModal(false);
      setShowAccountPrompt(true);
      return;
    }

    if (!currentTank || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('maintenance')
        .insert({
          tank_id: currentTank.id,
          user_id: user.id,
          task: newEntry.type,
          description: newEntry.notes,
          due_date: newEntry.date,
          status: 'pending',
        });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Maintenance logged!',
      });

      setShowAddModal(false);
      setNewEntry({
        type: 'water_change',
        notes: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadMaintenance();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save',
        text2: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return MAINTENANCE_TYPES.find(t => t.value === type) || { label: type, icon: '📝' };
  };

  const isReefMode = currentTank?.type !== 'freshwater';

  if (!currentTank) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode="reef" opacity={0.5} />
        <EmptyState
          icon="🐠"
          title="No Tank Selected"
          message="Please select a tank to view maintenance"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.accentPrimary}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-slate-800">Maintenance</Text>
          <Text className="text-slate-500">{currentTank.name}</Text>
        </View>

        {/* Entries List */}
        <View className="px-4 mt-4">
          {isLoading ? (
            <LoadingState message="Loading maintenance..." />
          ) : entries.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-aqua-200">
              <Text className="text-4xl mb-3">🔧</Text>
              <Text className="text-slate-800 font-semibold mb-1">No Maintenance Logged</Text>
              <Text className="text-slate-500 text-center text-sm">
                Tap the + button to log your first maintenance task
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {entries.map((entry) => {
                const typeInfo = getTypeInfo(entry.task);
                return (
                  <View
                    key={entry.id}
                    className="bg-white rounded-xl p-4 border border-aqua-200"
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{typeInfo.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-slate-800">{typeInfo.label}</Text>
                        <Text className="text-slate-500 text-sm">
                          {new Date(entry.due_date).toLocaleDateString()}
                        </Text>
                        {entry.description && (
                          <Text className="text-slate-600 text-sm mt-1">{entry.description}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-aqua-600 items-center justify-center shadow-lg"
        style={{ backgroundColor: theme.accentPrimary }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-slate-800">Log Maintenance</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <Text className="text-slate-700 font-medium mb-2">Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {MAINTENANCE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setNewEntry(prev => ({ ...prev, type: type.value }))}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    newEntry.type === type.value 
                      ? 'bg-aqua-600' 
                      : 'bg-white border border-aqua-200'
                  }`}
                  style={newEntry.type === type.value ? { backgroundColor: theme.accentPrimary } : {}}
                >
                  <View className="flex-row items-center">
                    <Text className="mr-1">{type.icon}</Text>
                    <Text className={newEntry.type === type.value ? 'text-white font-semibold' : 'text-slate-700'}>
                      {type.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date */}
            <Text className="text-slate-700 font-medium mb-2">Date</Text>
            <TextInput
              className="bg-white rounded-xl p-4 border border-aqua-200 mb-4 text-slate-800"
              value={newEntry.date}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
            />

            {/* Notes */}
            <Text className="text-slate-700 font-medium mb-2">Notes (optional)</Text>
            <TextInput
              className="bg-white rounded-xl p-4 border border-aqua-200 mb-6 text-slate-800"
              value={newEntry.notes}
              onChangeText={(text) => setNewEntry(prev => ({ ...prev, notes: text }))}
              placeholder="Add any notes..."
              multiline
              numberOfLines={3}
            />

            {/* Submit */}
            <TouchableOpacity
              onPress={handleAddEntry}
              disabled={isSubmitting}
              className="bg-aqua-600 rounded-xl py-4 items-center"
              style={{ backgroundColor: theme.accentPrimary }}
            >
              <Text className="text-white font-bold text-lg">
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CreateAccountPrompt
        visible={showAccountPrompt}
        onClose={() => setShowAccountPrompt(false)}
        title="Track Your Maintenance"
        message="Create a free account to schedule maintenance, get reminders, and keep a full history of your tank care."
      />
    </SafeAreaView>
  );
}
