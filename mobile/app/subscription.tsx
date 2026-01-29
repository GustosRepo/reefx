import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesPackage } from '@/lib/revenuecat';
import { useSubscription, useAquaMode, useAuth } from '@/context';
import { colors } from '@/constants/theme';
import Toast from 'react-native-toast-message';
import AquaticBackground from '@/components/AquaticBackground';
import { supabase } from '@/lib/supabase';

// Fallback pricing if RevenueCat isn't configured yet
const FALLBACK_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1 tank',
      'Parameter logging',
      'History & charts',
      'Maintenance tracking',
      'Ads enabled',
    ],
    color: '#64748b',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    period: '/month',
    features: [
      '3 tanks',
      'Everything in Free',
      'Gallery photos',
      'Export data',
      'Custom thresholds',
      'No ads',
    ],
    color: '#f59e0b',
    popular: true,
  },
  {
    id: 'super-premium',
    name: 'Super Premium',
    price: '$9.99',
    period: '/month',
    features: [
      '5 tanks',
      'Everything in Premium',
      'Equipment tracking',
      'Livestock management',
      'Priority support',
    ],
    color: '#8b5cf6',
  },
];

// Map RevenueCat package identifiers to our tier names
const PACKAGE_TO_TIER: Record<string, string> = {
  '$rc_monthly': 'premium',
  'premium_monthly': 'premium',
  'premium_yearly': 'premium',
  'super_premium_monthly': 'super-premium',
  'super_premium_yearly': 'super-premium',
};

const TIER_FEATURES_MAP: Record<string, string[]> = {
  'premium': [
    '3 tanks',
    'Everything in Free',
    'Gallery photos',
    'Export data',
    'Custom thresholds',
    'No ads',
  ],
  'super-premium': [
    '5 tanks',
    'Everything in Premium',
    'Equipment tracking',
    'Livestock management',
    'Priority support',
  ],
};

export default function SubscriptionScreen() {
  const { subscription, offerings, isLoadingOfferings, purchase, restore, activeProductId } = useSubscription();
  const { theme, isReefMode } = useAquaMode();
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [hasRevenueCatId, setHasRevenueCatId] = useState(false);

  // Check Supabase for revenuecat_product_id to determine if it's an IAP subscription
  useEffect(() => {
    const checkRevenueCatId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('subscriptions')
        .select('revenuecat_product_id')
        .eq('user_id', user.id)
        .single();
      setHasRevenueCatId(!!data?.revenuecat_product_id);
    };
    checkRevenueCatId();
  }, [user, subscription.tier]);

  // Check if user has a web subscription (has premium tier but no IAP product and no revenuecat_product_id)
  const hasWebSubscription = subscription.tier !== 'free' && !activeProductId && !hasRevenueCatId;


  const handlePurchase = async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const result = await purchase(pkg);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Welcome to Premium!',
          text2: 'Your subscription is now active',
        });
        router.back();
      } else if (result.error !== 'cancelled') {
        Toast.show({
          type: 'error',
          text1: 'Purchase failed',
          text2: result.error || 'Please try again',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Purchase failed',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await restore();
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Purchases restored',
          text2: 'Your subscription status has been updated',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'No purchases found',
          text2: 'No previous purchases to restore',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Restore failed',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Check if we're in Expo Go (RevenueCat preview mode) - offerings will be empty or have preview products
  const isPreviewMode = !offerings?.availablePackages?.length || 
    offerings?.availablePackages?.some(pkg => pkg.product?.identifier?.includes('preview'));
  
  // Show fallback plans in preview mode or when no real offerings
  const showFallbackPlans = isPreviewMode || isLoadingOfferings;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.5} />
      <Stack.Screen options={{ title: 'Subscription', headerShown: true }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-slate-800 mb-2">Choose Your Plan</Text>
        <Text className="text-slate-500 mb-6">
          Unlock more features with a premium subscription
        </Text>

        {/* Web Subscription Notice */}
        {hasWebSubscription && (
          <View className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="globe-outline" size={24} color="#8b5cf6" />
              <Text className="text-lg font-bold text-purple-800 ml-2">Active Subscription</Text>
            </View>
            <Text className="text-purple-700">
              You're currently subscribed to{' '}
              <Text className="font-bold">
                {subscription.tier === 'super-premium' ? 'Super Premium' : 'Premium'}
              </Text>
              . Enjoy all premium features!
            </Text>
          </View>
        )}

        {/* Free Plan - Always show */}
        <View
          className={`bg-white rounded-2xl p-4 border-2 mb-4 ${
            subscription.tier === 'free' ? 'border-aqua-500' : 'border-aqua-200'
          }`}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-xl font-bold text-slate-800">Free</Text>
              <View className="flex-row items-baseline">
                <Text className="text-3xl font-bold text-slate-500">$0</Text>
                <Text className="text-slate-500 ml-1">forever</Text>
              </View>
            </View>
            {subscription.tier === 'free' && (
              <View className="bg-aqua-100 px-3 py-1 rounded-full">
                <Text className="text-aqua-700 font-semibold text-sm">Current</Text>
              </View>
            )}
          </View>

          <View className="gap-2">
            {FALLBACK_PLANS[0].features.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#64748b" />
                <Text className="text-slate-600 ml-2">{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* RevenueCat Packages or Fallback Plans */}
        {isLoadingOfferings ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color={theme.accentPrimary} />
            <Text className="text-slate-500 mt-2">Loading plans...</Text>
          </View>
        ) : showFallbackPlans ? (
          // Show fallback plans (in Expo Go or when RevenueCat isn't configured)
          <View className="gap-4">
            {FALLBACK_PLANS.slice(1).map((plan) => {
              const isCurrentPlan = subscription.tier === plan.id;
              
              return (
                <View
                  key={plan.id}
                  className={`bg-white rounded-2xl p-4 border-2 ${
                    isCurrentPlan ? 'border-aqua-500' : 'border-aqua-200'
                  }`}
                >
                  {plan.popular && (
                    <View className="absolute -top-3 left-4 bg-yellow-400 px-3 py-1 rounded-full">
                      <Text className="text-yellow-900 text-xs font-bold">POPULAR</Text>
                    </View>
                  )}
                  
                  <View className="flex-row items-center justify-between mb-4 mt-2">
                    <View>
                      <Text className="text-xl font-bold text-slate-800">{plan.name}</Text>
                      <View className="flex-row items-baseline">
                        <Text className="text-3xl font-bold" style={{ color: plan.color }}>
                          {plan.price}
                        </Text>
                        <Text className="text-slate-500 ml-1">{plan.period}</Text>
                      </View>
                    </View>
                    {isCurrentPlan && (
                      <View className="bg-aqua-100 px-3 py-1 rounded-full">
                        <Text className="text-aqua-700 font-semibold text-sm">Current</Text>
                      </View>
                    )}
                  </View>

                  <View className="gap-2">
                    {plan.features.map((feature, index) => (
                      <View key={index} className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                        <Text className="text-slate-600 ml-2">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {!isCurrentPlan && !hasWebSubscription && (
                    <TouchableOpacity
                      onPress={() => Alert.alert(
                        'Expo Go Preview', 
                        'In-app purchases require a native build. Use "npx expo run:ios" or submit to TestFlight to test real purchases.'
                      )}
                      className="mt-4 rounded-xl py-3 items-center"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Text className="text-white font-bold">Subscribe</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="gap-4">
            {offerings!.availablePackages.map((pkg) => {
              const tierName = PACKAGE_TO_TIER[pkg.identifier] || 'premium';
              const isPremium = tierName === 'premium';
              const isSuperPremium = tierName === 'super-premium';
              // Check if this exact product is the active one (IAP) OR if web subscription matches this tier
              const isCurrentPlan = activeProductId === pkg.product.identifier || 
                (hasWebSubscription && subscription.tier === tierName);
              const planColor = isSuperPremium ? '#8b5cf6' : '#f59e0b';
              const features = TIER_FEATURES_MAP[tierName] || TIER_FEATURES_MAP['premium'];
              const isYearly = pkg.packageType === 'ANNUAL' || pkg.identifier.includes('yearly') || pkg.identifier.includes('annual');

              return (
                <View
                  key={pkg.identifier}
                  className={`bg-white rounded-2xl p-4 border-2 ${
                    isCurrentPlan ? 'border-aqua-500' : 'border-aqua-200'
                  }`}
                >
                  {isPremium && !isYearly && (
                    <View className="absolute -top-3 left-4 bg-yellow-400 px-3 py-1 rounded-full">
                      <Text className="text-yellow-900 text-xs font-bold">POPULAR</Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between mb-4 mt-2">
                    <View>
                      <Text className="text-xl font-bold text-slate-800">
                        {pkg.product.title.replace(' (AquaXone)', '')}
                      </Text>
                      <View className="flex-row items-baseline">
                        <Text className="text-3xl font-bold" style={{ color: planColor }}>
                          {pkg.product.priceString}
                        </Text>
                        <Text className="text-slate-500 ml-1">
                          /{isYearly ? 'year' : 'month'}
                        </Text>
                      </View>
                      {isYearly && (
                        <Text className="text-green-600 text-sm font-medium">
                          Save ~17% vs monthly
                        </Text>
                      )}
                    </View>
                    {isCurrentPlan && (
                      <View className="bg-aqua-100 px-3 py-1 rounded-full">
                        <Text className="text-aqua-700 font-semibold text-sm">Current</Text>
                      </View>
                    )}
                  </View>

                  <View className="gap-2 mb-4">
                    {features.map((feature, index) => (
                      <View key={index} className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={18} color={planColor} />
                        <Text className="text-slate-600 ml-2">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {!isCurrentPlan && !hasWebSubscription && (
                    <TouchableOpacity
                      onPress={() => handlePurchase(pkg)}
                      disabled={isPurchasing}
                      className="rounded-xl py-3 items-center"
                      style={{ backgroundColor: planColor }}
                    >
                      {isPurchasing ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white font-bold">Subscribe</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Restore Purchases */}
        <TouchableOpacity
          onPress={handleRestore}
          disabled={isRestoring}
          className="mt-6 py-3 items-center"
        >
          {isRestoring ? (
            <ActivityIndicator color={theme.accentPrimary} />
          ) : (
            <Text className="font-semibold" style={{ color: theme.accentPrimary }}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        <Text className="text-slate-400 text-center text-sm mt-4">
          Subscriptions are managed through the App Store.{'\n'}
          Cancel anytime in your device settings.
        </Text>

        {/* Terms */}
        <View className="mt-4 gap-1">
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text className="text-center text-sm" style={{ color: theme.accentPrimary }}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text className="text-center text-sm" style={{ color: theme.accentPrimary }}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
