import { Redirect } from 'expo-router';
import { useAuth } from '@/context';
import { View, ActivityIndicator } from 'react-native';
import { modeThemes } from '@/constants/theme';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={modeThemes.reef.accentPrimary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
