import { View, Text, TouchableOpacity, StyleSheet, Animated as RNAnimated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context';
import { colors } from '@/constants/theme';
import { useRef, useEffect } from 'react';

/**
 * Floating bottom bar that sticks above the tab bar in guest mode.
 * Persistent, visible on every screen, but dismissible per session.
 */
export function GuestFloatingBar() {
  const router = useRouter();
  const { isGuestMode } = useAuth();
  const slideAnim = useRef(new RNAnimated.Value(100)).current;

  useEffect(() => {
    if (isGuestMode) {
      // Slide up after a small delay for a nice entrance
      RNAnimated.spring(slideAnim, {
        toValue: 0,
        delay: 1000,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isGuestMode]);

  if (!isGuestMode) return null;

  return (
    <RNAnimated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Enjoying AquaXone?</Text>
          <Text style={styles.subtitle}>Create a free account to save your data</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Sign Up Free</Text>
        </TouchableOpacity>
      </View>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // above tab bar
    left: 12,
    right: 12,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.dark,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
