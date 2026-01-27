import { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAquaMode, useTank } from '@/context';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export default function NotificationsScreen() {
  const { theme } = useAquaMode();
  const { currentTank } = useTank();
  const isReefMode = currentTank?.type !== 'freshwater';
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'parameter_alerts',
      title: 'Parameter Alerts',
      description: 'Get notified when parameters are out of range',
      enabled: true,
    },
    {
      id: 'maintenance_reminders',
      title: 'Maintenance Reminders',
      description: 'Reminders for scheduled maintenance tasks',
      enabled: true,
    },
    {
      id: 'water_change',
      title: 'Water Change Reminders',
      description: 'Weekly water change notifications',
      enabled: false,
    },
    {
      id: 'feeding',
      title: 'Feeding Reminders',
      description: 'Daily feeding schedule notifications',
      enabled: false,
    },
    {
      id: 'tips',
      title: 'Tips & Insights',
      description: 'Helpful tips for better aquarium care',
      enabled: true,
    },
    {
      id: 'promotions',
      title: 'Promotions & Updates',
      description: 'New features and special offers',
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-aqua-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Push Notifications Status */}
        <View className="bg-aqua-50 rounded-xl p-4 mb-6 flex-row items-center">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.accentPrimary}20` }}>
            <Ionicons name="notifications" size={20} color={theme.accentPrimary} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-slate-800">Push Notifications</Text>
            <Text className="text-sm text-slate-500">Enabled on this device</Text>
          </View>
          <View className="bg-green-100 px-2 py-1 rounded">
            <Text className="text-green-700 text-xs font-medium">Active</Text>
          </View>
        </View>

        {/* Settings List */}
        <Text className="text-lg font-bold text-slate-800 mb-3">Notification Preferences</Text>

        {settings.map((setting, index) => (
          <View
            key={setting.id}
            className={`bg-white rounded-xl p-4 mb-3 border border-aqua-200`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="font-semibold text-slate-800">{setting.title}</Text>
                <Text className="text-sm text-slate-500 mt-1">{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#e2e8f0', true: theme.accentPrimary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        ))}

        {/* Quiet Hours */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-slate-800 mb-3">Quiet Hours</Text>
          
          <View className="bg-white rounded-xl p-4 border border-aqua-200">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="font-semibold text-slate-800">Enable Quiet Hours</Text>
                <Text className="text-sm text-slate-500">Pause notifications during set times</Text>
              </View>
              <Switch
                value={false}
                trackColor={{ false: '#e2e8f0', true: theme.accentPrimary }}
                thumbColor="#ffffff"
              />
            </View>
            
            <View className="flex-row justify-between pt-3 border-t border-slate-100 opacity-50">
              <View>
                <Text className="text-sm text-slate-500">From</Text>
                <Text className="font-medium text-slate-700">10:00 PM</Text>
              </View>
              <View>
                <Text className="text-sm text-slate-500">To</Text>
                <Text className="font-medium text-slate-700">7:00 AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info */}
        <View className="mt-6 mb-8 px-4">
          <Text className="text-sm text-slate-400 text-center">
            Notification settings are synced across all your devices
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
