import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTank, useSubscription, useAquaMode } from '@/context';
import { LoadingState } from '@/components';
import { colors } from '@/constants/theme';
import { LivestockItem } from '@shared/types';

export default function LivestockScreen() {
  const { currentTank } = useTank();
  const { features } = useSubscription();
  const { theme } = useAquaMode();
  
  const [livestock, setLivestock] = useState<LivestockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    }
  }, [currentTank]);

  useEffect(() => {
    loadLivestock();
  }, [loadLivestock]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fish': return '🐠';
      case 'coral': return '🪸';
      case 'invertebrate': return '🦐';
      case 'plant': return '🌿';
      default: return '🐟';
    }
  };

  if (!features.livestock) {
    return (
      <SafeAreaView className="flex-1 bg-background">
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
      <Stack.Screen options={{ title: 'Livestock', headerShown: true }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <LoadingState message="Loading livestock..." />
        ) : livestock.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">🐠</Text>
            <Text className="text-xl font-bold text-slate-800 mb-2">No Livestock</Text>
            <Text className="text-slate-500 text-center">
              Add your fish, corals, and invertebrates
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {livestock.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-xl p-4 border border-aqua-200"
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{getTypeIcon(item.type)}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-800">{item.name}</Text>
                    {item.species && <Text className="text-slate-500 text-sm">{item.species}</Text>}
                    <Text className="text-slate-400 text-sm capitalize">{item.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
