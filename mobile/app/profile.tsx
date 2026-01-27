import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAquaMode, useTank } from '@/context';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useAquaMode();
  const { currentTank } = useTank();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const isReefMode = currentTank?.type !== 'freshwater';

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-aqua-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Avatar */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-3" style={{ backgroundColor: theme.accentPrimary }}>
            <Text className="text-white text-3xl font-bold">
              {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </Text>
          </View>
          <Text className="text-slate-500">{user?.email}</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-2">Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              className="bg-white border border-aqua-200 rounded-xl px-4 py-3 text-slate-800"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-700 mb-2">Email</Text>
            <View className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
              <Text className="text-slate-500">{user?.email}</Text>
            </View>
            <Text className="text-xs text-slate-400 mt-1">Email cannot be changed</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="mt-8 py-4 rounded-xl items-center"
          style={{ backgroundColor: theme.accentPrimary, opacity: loading ? 0.6 : 1 }}
        >
          <Text className="text-white font-semibold text-lg">
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          onPress={() => Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => {} }
            ]
          )}
          className="mt-6 py-4 items-center"
        >
          <Text className="text-red-500 font-medium">Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
