import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useAquaMode } from '@/context';
import { Redirect } from 'expo-router';
import { GuestFloatingBar } from '@/components';
import { colors } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabBarIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return (
    <View className="items-center justify-center">
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { user, isLoading, isGuestMode } = useAuth();
  const { theme } = useAquaMode();

  if (isLoading) {
    return null;
  }

  if (!user && !isGuestMode) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: theme.accentPrimary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: colors.border.light,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background.primary,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'create' : 'create-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'Maint.',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'build' : 'build-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'menu' : 'menu-outline'} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
      <GuestFloatingBar />
    </View>
  );
}
