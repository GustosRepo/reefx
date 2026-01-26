import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTank, useAquaMode } from '@/context';
import { colors, modeThemes } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type TankType = 'reef' | 'freshwater';

export default function NewTankScreen() {
  const { refreshTanks } = useTank();
  const { mode } = useAquaMode();
  
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [type, setType] = useState<TankType>(mode === 'freshwater' ? 'freshwater' : 'reef');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a tank name');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('tanks')
        .insert({
          name: name.trim(),
          size_gallons: size ? parseFloat(size) : null,
          type,
          user_id: user.id,
        });

      if (error) throw error;

      await refreshTanks?.();
      Alert.alert('Success', 'Tank created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create tank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-aqua-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">New Tank</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Tank Type Selection */}
        <Text className="text-sm font-medium text-slate-700 mb-2">Tank Type</Text>
        <View className="flex-row mb-6">
          <TouchableOpacity
            onPress={() => setType('reef')}
            className={`flex-1 p-4 rounded-xl mr-2 border-2 ${
              type === 'reef' 
                ? 'bg-cyan-50 border-cyan-500' 
                : 'bg-white border-slate-200'
            }`}
          >
            <Text className="text-2xl text-center mb-2">🪸</Text>
            <Text className={`text-center font-semibold ${
              type === 'reef' ? 'text-cyan-700' : 'text-slate-600'
            }`}>
              Reef / Saltwater
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType('freshwater')}
            className={`flex-1 p-4 rounded-xl ml-2 border-2 ${
              type === 'freshwater' 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-white border-slate-200'
            }`}
          >
            <Text className="text-2xl text-center mb-2">🌿</Text>
            <Text className={`text-center font-semibold ${
              type === 'freshwater' ? 'text-emerald-700' : 'text-slate-600'
            }`}>
              Freshwater
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tank Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-slate-700 mb-2">Tank Name *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={type === 'reef' ? 'My Reef Tank' : 'Planted Tank'}
            className="bg-white border border-aqua-200 rounded-xl px-4 py-3 text-slate-800"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Tank Size */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-700 mb-2">Tank Size (gallons)</Text>
          <TextInput
            value={size}
            onChangeText={setSize}
            placeholder="e.g., 75"
            keyboardType="numeric"
            className="bg-white border border-aqua-200 rounded-xl px-4 py-3 text-slate-800"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Common Sizes */}
        <View className="mb-6">
          <Text className="text-sm text-slate-500 mb-2">Common sizes:</Text>
          <View className="flex-row flex-wrap">
            {['10', '20', '29', '40', '55', '75', '90', '120', '180'].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSize(s)}
                className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                  size === s ? '' : 'bg-slate-100'
                }`}
                style={size === s ? { backgroundColor: type === 'reef' ? modeThemes.reef.accentPrimary : modeThemes.freshwater.accentPrimary } : {}}
              >
                <Text className={size === s ? 'text-white' : 'text-slate-600'}>
                  {s}g
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Box */}
        <View className="bg-slate-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color={colors.text.muted} />
            <Text className="flex-1 ml-2 text-slate-500 text-sm">
              {type === 'reef' 
                ? 'Reef mode will track saltwater parameters like alkalinity, calcium, and magnesium.'
                : 'Freshwater mode will track parameters like GH, KH, ammonia, and nitrite.'}
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading || !name.trim()}
          className="py-4 rounded-xl items-center"
          style={{ 
            backgroundColor: type === 'reef' ? modeThemes.reef.accentPrimary : modeThemes.freshwater.accentPrimary,
            opacity: loading || !name.trim() ? 0.6 : 1 
          }}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Creating...' : 'Create Tank'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
