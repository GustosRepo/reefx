import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useAquaMode, useTank } from '@/context';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { STORAGE_KEYS } from '@/constants/app';
import { storage } from '@/lib/storage';

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const DEFAULT_SETTINGS: NotificationSetting[] = [
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
];

export default function NotificationsScreen() {
  const { theme } = useAquaMode();
  const { currentTank } = useTank();
  const isReefMode = currentTank?.type !== 'freshwater';

  const [settings, setSettings] = useState<NotificationSetting[]>(DEFAULT_SETTINGS);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // Check real permission status when screen focuses
  useFocusEffect(
    useCallback(() => {
      checkPermissionStatus();
    }, [])
  );

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status as 'granted' | 'denied' | 'undetermined');
    } catch {
      setPermissionStatus('undetermined');
    }
  };

  const loadSettings = async () => {
    try {
      const saved = await storage.get<Record<string, boolean>>(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (saved) {
        setSettings(prev =>
          prev.map(s => ({
            ...s,
            enabled: saved[s.id] !== undefined ? saved[s.id] : s.enabled,
          }))
        );
      }
    } catch {
      // Use defaults
    }
  };

  const saveSettings = async (updated: NotificationSetting[]) => {
    try {
      const map: Record<string, boolean> = {};
      updated.forEach(s => { map[s.id] = s.enabled; });
      await storage.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, map);
    } catch {
      // Silently fail
    }
  };

  const toggleSetting = (id: string) => {
    const updated = settings.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    setSettings(updated);
    saveSettings(updated);
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status as 'granted' | 'denied' | 'undetermined');
    if (status === 'denied') {
      // Direct to settings if denied
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        Linking.openSettings();
      }
    }
  };

  const permissionLabel = permissionStatus === 'granted'
    ? 'Active'
    : permissionStatus === 'denied'
    ? 'Denied'
    : 'Not Set';

  const permissionColor = permissionStatus === 'granted'
    ? { bg: 'bg-green-100', text: 'text-green-700' }
    : permissionStatus === 'denied'
    ? { bg: 'bg-red-100', text: 'text-red-700' }
    : { bg: 'bg-yellow-100', text: 'text-yellow-700' };

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
        <TouchableOpacity
          onPress={permissionStatus !== 'granted' ? requestPermission : undefined}
          activeOpacity={permissionStatus !== 'granted' ? 0.7 : 1}
          className="bg-aqua-50 rounded-xl p-4 mb-6 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${theme.accentPrimary}20` }}>
            <Ionicons name="notifications" size={20} color={theme.accentPrimary} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-slate-800">Push Notifications</Text>
            <Text className="text-sm text-slate-500">
              {permissionStatus === 'granted'
                ? 'Enabled on this device'
                : permissionStatus === 'denied'
                ? 'Tap to open settings'
                : 'Tap to enable notifications'}
            </Text>
          </View>
          <View className={`${permissionColor.bg} px-2 py-1 rounded`}>
            <Text className={`${permissionColor.text} text-xs font-medium`}>{permissionLabel}</Text>
          </View>
        </TouchableOpacity>

        {/* Settings List */}
        <Text className="text-lg font-bold text-slate-800 mb-3">Notification Preferences</Text>

        {settings.map((setting) => (
          <View
            key={setting.id}
            className="bg-white rounded-xl p-4 mb-3 border border-aqua-200"
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

        {/* Configure Thresholds Link */}
        <TouchableOpacity
          onPress={() => router.push('/thresholds')}
          className="bg-white rounded-xl p-4 mb-3 border border-aqua-200 flex-row items-center"
        >
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${theme.accentPrimary}20` }}
          >
            <Ionicons name="speedometer-outline" size={20} color={theme.accentPrimary} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-slate-800">Parameter Thresholds</Text>
            <Text className="text-sm text-slate-500 mt-1">Set min/max ranges for alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
        </TouchableOpacity>

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
            Notification preferences are saved locally on this device
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
