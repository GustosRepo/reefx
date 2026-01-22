import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTank, useSubscription } from '@/context';
import { LoadingState } from '@/components';
import { colors } from '@/constants/theme';
import { EquipmentItem } from '@shared/types';

export default function EquipmentScreen() {
  const { currentTank } = useTank();
  const { features } = useSubscription();
  
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    }
  }, [currentTank]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  if (!features.equipment) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Equipment', headerShown: true }} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-slate-800 mb-2">Super Premium Feature</Text>
          <Text className="text-slate-500 text-center mb-6">
            Upgrade to Super Premium to track your equipment
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/subscription')}
            className="bg-aqua-600 rounded-xl py-3 px-6"
          >
            <Text className="text-white font-bold">Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: 'Equipment', headerShown: true }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <LoadingState message="Loading equipment..." />
        ) : equipment.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🛠️</Text>
            <Text className="text-xl font-bold text-slate-800 mb-2">No Equipment</Text>
            <Text className="text-slate-500 text-center">
              Add your pumps, lights, skimmers and more
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {equipment.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-xl p-4 border border-aqua-200"
              >
                <Text className="font-semibold text-slate-800">{item.name}</Text>
                <Text className="text-slate-500 text-sm">{item.category}</Text>
                {item.brand && <Text className="text-slate-400 text-sm">{item.brand}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
