import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context';
import { colors } from '@/constants/theme';

interface GuestModeBannerProps {
  message?: string;
  compact?: boolean;
}

export function GuestModeBanner({ 
  message = "Create an account to save your data and sync across devices", 
  compact = false 
}: GuestModeBannerProps) {
  const router = useRouter();
  const { isGuestMode } = useAuth();

  if (!isGuestMode) {
    return null;
  }

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.content}>
        <Text style={styles.icon}>👤</Text>
        <Text style={[styles.message, compact && styles.messageCompact]}>
          {message}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/register')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.light,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerCompact: {
    padding: 12,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  message: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  messageCompact: {
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
