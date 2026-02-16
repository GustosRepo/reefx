// Global error handler - must be first to capture all errors
if (global.ErrorUtils) {
  const originalHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    console.warn(`[GLOBAL ERROR] fatal=${isFatal}: ${error?.message || error}`);
    console.warn(`[GLOBAL ERROR] stack: ${error?.stack?.substring(0, 500)}`);
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider, AquaModeProvider, TankProvider, SubscriptionProvider } from '@/context';
import { colors } from '@/constants/theme';
import '@/styles/global.css';

// Error boundary to prevent fatal crashes
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('App error caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#334155' }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>Please restart the app</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  // Initialize push notifications lazily to avoid startup crashes
  React.useEffect(() => {
    try {
      const { initPushNotifications } = require('@/hooks/usePushNotifications');
      initPushNotifications();
    } catch (e) {
      console.warn('Push notification init failed:', e);
    }
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AquaModeProvider>
              <SubscriptionProvider>
                <TankProvider>
                  <AppContent />
                </TankProvider>
              </SubscriptionProvider>
            </AquaModeProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
