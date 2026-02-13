import { Redirect } from 'expo-router';
import { useAuth } from '@/context';
import { View, ActivityIndicator } from 'react-native';
import { modeThemes } from '@/constants/theme';
import { onboardingStorage } from '@/lib';
import { useEffect, useState } from 'react';

export default function Index() {
  const { user, isLoading, isGuestMode } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    checkOnboardingStatus();
  }, [isGuestMode]); // Re-check when guest mode changes

  const checkOnboardingStatus = async () => {
    const completed = await onboardingStorage.hasCompletedOnboarding();
    setHasCompletedOnboarding(completed);
    setCheckCount(c => c + 1);
  };

  if (isLoading || hasCompletedOnboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={modeThemes.reef.accentPrimary} />
      </View>
    );
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // Allow guest mode users to access the app
  if (user || isGuestMode) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
