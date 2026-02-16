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
    icon: '🚨',
    title: 'Your Tank Crashed. What Went Wrong?',
    description: 'Track every parameter so you catch problems before they kill your livestock. Know exactly what\'s happening in your $5,000+ reef.',
  },
  {
    id: 2,
    icon: '🔔',
    title: 'Get Alerts Before It\'s Too Late',
    description: 'Smart thresholds notify you the moment pH, ammonia, or nitrates spike - not after your coral dies. Automated reminders for water changes.',
  },
  {
    id: 3,
    icon: '🌟',
    title: 'Join 10,000+ Successful Aquarists',
    description: '📊 Beautiful charts & trends\n🪸 Reef & freshwater modes\n📱 Track livestock & equipment\n🔬 Complete test history',
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
          <View style={styles.finalButtonsContainer}>
            <TouchableOpacity
              onPress={handleTryDemo}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Try Free Demo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleComplete}
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
  nextButton: {
    backgroundColor: colors.brand.primary,
    paddingVertical: 18,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});