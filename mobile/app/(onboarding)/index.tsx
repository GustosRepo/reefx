import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Image } from 'react-native';
import { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { onboardingStorage } from '@/lib';
import { useAuth } from '@/context';
import { colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    icon: '🐠',
    title: 'Welcome to AquaXone',
    description: 'Your complete aquarium management companion. Track, monitor, and maintain your aquatic ecosystem with ease.',
  },
  {
    id: 2,
    icon: '💧',
    title: 'Water Parameter Tracking',
    description: 'Log pH, ammonia, nitrite, nitrate, and more. View trends over time and get alerts when levels are out of range.',
  },
  {
    id: 3,
    icon: '📊',
    title: 'Visual Insights',
    description: 'Beautiful charts and graphs show your tank\'s health at a glance. Identify patterns and make data-driven decisions.',
  },
  {
    id: 4,
    icon: '🪸',
    title: 'Reef & Freshwater',
    description: 'Specialized modes for saltwater reef tanks and freshwater setups. Get parameter recommendations for your specific tank type.',
  },
  {
    id: 5,
    icon: '🔔',
    title: 'Smart Reminders',
    description: 'Never miss a water change, filter cleaning, or feeding. Set custom maintenance schedules tailored to your tank.',
  },
  {
    id: 6,
    icon: '📱',
    title: 'All-in-One Solution',
    description: 'Track livestock, equipment, gallery photos, and complete maintenance history. Everything you need in one app.',
  },
  {
    id: 7,
    icon: '🚀',
    title: 'Ready to Dive In?',
    description: 'Try the app with demo data or create your account to start tracking your own aquarium today!',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { enterGuestMode } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const handleComplete = async () => {
    await onboardingStorage.setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const handleTryDemo = async () => {
    await onboardingStorage.setOnboardingComplete();
    await enterGuestMode();
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      translateX.value = withSpring(-(currentIndex + 1) * SCREEN_WIDTH);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newTranslateX = contextX.value + event.translationX;
      const maxTranslate = -(onboardingData.length - 1) * SCREEN_WIDTH;
      
      // Limit panning to valid range
      if (newTranslateX <= 0 && newTranslateX >= maxTranslate) {
        translateX.value = newTranslateX;
      }
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const shouldMoveNext = velocity < -500 || (velocity < 0 && event.translationX < -SCREEN_WIDTH / 3);
      const shouldMovePrev = velocity > 500 || (velocity > 0 && event.translationX > SCREEN_WIDTH / 3);

      if (shouldMoveNext && currentIndex < onboardingData.length - 1) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        translateX.value = withSpring(-newIndex * SCREEN_WIDTH);
      } else if (shouldMovePrev && currentIndex > 0) {
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        translateX.value = withSpring(-newIndex * SCREEN_WIDTH);
      } else {
        // Snap back to current position
        translateX.value = withSpring(-currentIndex * SCREEN_WIDTH);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.slidesContainer, animatedStyle]}>
          {onboardingData.map((item, index) => (
            <OnboardingSlide
              key={item.id}
              item={item}
              index={index}
              currentIndex={currentIndex}
            />
          ))}
        </Animated.View>
      </GestureDetector>

      <View style={styles.footer}>
        <Pagination data={onboardingData} currentIndex={currentIndex} />
        
        {currentIndex === onboardingData.length - 1 ? (
          // Last slide - show both options
          <View style={styles.finalButtonsContainer}>
            <TouchableOpacity
              onPress={handleTryDemo}
              style={styles.demoButton}
              activeOpacity={0.8}
            >
              <Text style={styles.demoButtonText}>Try Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleComplete}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Other slides - show next button
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function OnboardingSlide({ item, index, currentIndex }: { 
  item: typeof onboardingData[0]; 
  index: number; 
  currentIndex: number;
}) {
  return (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
}

function Pagination({ data, currentIndex }: { data: any[]; currentIndex: number }) {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-end',
    height: 50,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * onboardingData.length,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background.secondary,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: colors.brand.primary,
  },
  finalButtonsContainer: {
    gap: 12,
  },
  demoButton: {
    backgroundColor: colors.background.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brand.primary,
  },
  demoButtonText: {
    color: colors.brand.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
