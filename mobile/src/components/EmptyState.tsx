import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-bold text-slate-800 mb-2 text-center">{title}</Text>
      <Text className="text-slate-500 text-center">{message}</Text>
    </View>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-8">
      <View className="w-16 h-16 rounded-full bg-aqua-100 items-center justify-center mb-4">
        <Ionicons name="fish" size={32} color={colors.brand.primary} />
      </View>
      <Text className="text-slate-500">{message}</Text>
    </View>
  );
}

export default EmptyState;
