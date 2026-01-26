import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useSubscription, useTank, useAquaMode } from '@/context';
import { colors } from '@/constants/theme';
import Toast from 'react-native-toast-message';

type MenuItemProps = {
  icon: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  locked?: boolean;
  badge?: string;
  accentColor?: string;
};

function MenuItem({ icon, iconName, title, subtitle, onPress, locked, badge, accentColor }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={locked}
      className={`flex-row items-center p-4 bg-white rounded-xl border border-aqua-200 mb-3 ${locked ? 'opacity-50' : ''}`}
    >
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: accentColor ? `${accentColor}20` : undefined }}
      >
        {icon ? (
          <Text className="text-xl">{icon}</Text>
        ) : iconName ? (
          <Ionicons name={iconName} size={20} color={accentColor || colors.brand.primary} />
        ) : null}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="font-semibold text-slate-800">{title}</Text>
          {locked && (
            <View className="ml-2 bg-yellow-100 px-2 py-0.5 rounded">
              <Text className="text-yellow-700 text-xs font-medium">Premium</Text>
            </View>
          )}
          {badge && (
            <View className="ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: accentColor ? `${accentColor}20` : undefined }}>
              <Text className="text-xs font-medium" style={{ color: accentColor }}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && <Text className="text-slate-500 text-sm">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { user, signOut } = useAuth();
  const { subscription, features } = useSubscription();
  const { tanks, deleteTank, currentTank } = useTank();
  const { theme } = useAquaMode();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleDeleteTank = (tankId: string, tankName: string) => {
    // Prevent deleting current tank without confirmation
    const isCurrentTank = currentTank?.id === tankId;
    const isLastTank = tanks.length <= 1;
    
    Alert.alert(
      'Delete Tank',
      `Are you sure you want to delete "${tankName}"?${isCurrentTank ? '\n\nThis is your current tank.' : ''}${isLastTank ? '\n\nThis is your only tank. You\'ll need to create a new one.' : ''}\n\nAll logs, maintenance records, and data associated with this tank will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteTank(tankId);
            if (success) {
              Toast.show({
                type: 'success',
                text1: 'Tank deleted',
                text2: `${tankName} has been removed`,
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Delete failed',
                text2: 'Could not delete the tank',
              });
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-slate-800">More</Text>
        </View>

        {/* User Profile Section */}
        <View className="px-4 mt-4">
          <View className="bg-white rounded-2xl p-4 border border-aqua-200 mb-6">
            <View className="flex-row items-center">
              <View 
                className="w-14 h-14 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: theme.accentPrimary }}
              >
                <Text className="text-white text-xl font-bold">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-800 text-lg">
                  {user?.name || 'Aquarist'}
                </Text>
                <Text className="text-slate-500">{user?.email}</Text>
                <View className="flex-row items-center mt-1">
                  <View className={`px-2 py-0.5 rounded ${
                    subscription.tier === 'super-premium' ? 'bg-purple-100' :
                    subscription.tier === 'premium' ? 'bg-yellow-100' : 'bg-slate-100'
                  }`}>
                    <Text className={`text-xs font-medium ${
                      subscription.tier === 'super-premium' ? 'text-purple-700' :
                      subscription.tier === 'premium' ? 'text-yellow-700' : 'text-slate-600'
                    }`}>
                      {subscription.tier === 'super-premium' ? 'Super Premium' :
                       subscription.tier === 'premium' ? 'Premium' : 'Free'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View className="px-4">
          <Text className="text-lg font-bold text-slate-800 mb-3">Features</Text>

          <MenuItem
            icon="📸"
            title="Gallery"
            subtitle="Photos of your aquarium"
            onPress={() => router.push('/gallery')}
            locked={!features.gallery}
            accentColor={theme.accentPrimary}
          />

          <MenuItem
            icon="🛠️"
            title="Equipment"
            subtitle="Track your gear"
            onPress={() => router.push('/equipment')}
            locked={!features.equipment}
            accentColor={theme.accentPrimary}
          />

          <MenuItem
            icon="🐠"
            title="Livestock"
            subtitle="Fish, corals & inverts"
            onPress={() => router.push('/livestock')}
            locked={!features.livestock}
            accentColor={theme.accentPrimary}
          />

          <MenuItem
            icon="📚"
            title="Guides"
            subtitle="Learn about aquarium keeping"
            onPress={() => router.push('/learn')}
            accentColor={theme.accentPrimary}
          />
        </View>

        {/* Tanks Section */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-slate-800 mb-3">Your Tanks</Text>

          <View className="bg-white rounded-2xl border border-aqua-200 overflow-hidden">
            {tanks.map((tank, index) => (
              <View
                key={tank.id}
                className={`flex-row items-center p-4 ${index < tanks.length - 1 ? 'border-b border-aqua-100' : ''}`}
              >
                <Text className="text-xl mr-3">
                  {tank.type === 'freshwater' ? '🌿' : '🪸'}
                </Text>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-semibold text-slate-800">{tank.name}</Text>
                    {currentTank?.id === tank.id && (
                      <View 
                        className="ml-2 px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${theme.accentPrimary}20` }}
                      >
                        <Text className="text-xs font-medium" style={{ color: theme.accentPrimary }}>Active</Text>
                      </View>
                    )}
                  </View>
                  {tank.size_gallons && <Text className="text-slate-500 text-sm">{tank.size_gallons} gallons</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteTank(tank.id, tank.name)}
                  className="p-2 -mr-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {tanks.length < features.maxTanks && (
              <TouchableOpacity
                onPress={() => router.push('/tank/new')}
                className="flex-row items-center p-4 border-t border-aqua-100"
              >
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${theme.accentPrimary}20` }}
                >
                  <Ionicons name="add" size={20} color={theme.accentPrimary} />
                </View>
                <Text className="font-semibold" style={{ color: theme.accentPrimary }}>Add New Tank</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-slate-400 text-sm mt-2 text-center">
            {tanks.length} of {features.maxTanks} tanks used
          </Text>
        </View>

        {/* Settings Section */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-slate-800 mb-3">Settings</Text>

          <MenuItem
            iconName="person-outline"
            icon=""
            title="Profile"
            subtitle="Edit your account"
            onPress={() => router.push('/profile')}
            accentColor={theme.accentPrimary}
          />

          <MenuItem
            iconName="notifications-outline"
            icon=""
            title="Notifications"
            subtitle="Manage alerts"
            onPress={() => router.push('/notifications')}
            accentColor={theme.accentPrimary}
          />

          <MenuItem
            iconName="card-outline"
            icon=""
            title="Subscription"
            subtitle="Manage your plan"
            onPress={() => router.push('/subscription')}
            accentColor={theme.accentPrimary}
          />

          <MenuItem
            iconName="help-circle-outline"
            icon=""
            title="Help & Support"
            subtitle="FAQs and contact"
            onPress={() => router.push('/help')}
            accentColor={theme.accentPrimary}
          />
        </View>

        {/* Logout */}
        <View className="px-4 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 bg-red-50 rounded-xl border border-red-200"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center mt-6 pb-4">
          <Text className="text-slate-400 text-sm">AquaXone v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
