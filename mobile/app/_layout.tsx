import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider, AquaModeProvider, TankProvider, SubscriptionProvider } from '@/context';
import { colors } from '@/constants/theme';
import '@/styles/global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AquaModeProvider>
            <SubscriptionProvider>
              <TankProvider>
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
              </TankProvider>
            </SubscriptionProvider>
          </AquaModeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
