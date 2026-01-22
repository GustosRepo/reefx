import { Redirect } from 'expo-router';
import { useAuth } from '@/context';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/theme';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
