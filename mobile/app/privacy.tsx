import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function PrivacyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: 'Privacy Policy', headerShown: true }} />
      
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-slate-800 mb-4">Privacy Policy</Text>
        <Text className="text-slate-500 mb-6">Last updated: January 2026</Text>

        <View className="gap-6">
          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">1. Information We Collect</Text>
            <Text className="text-slate-600 leading-6">
              AquaXone collects information you provide directly, including:{'\n\n'}
              • Account information (email, name){'\n'}
              • Aquarium data (tank parameters, maintenance logs){'\n'}
              • Photos you upload to the gallery{'\n'}
              • Equipment and livestock records
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">2. How We Use Your Information</Text>
            <Text className="text-slate-600 leading-6">
              We use your information to:{'\n\n'}
              • Provide and improve the AquaXone service{'\n'}
              • Sync your data across devices{'\n'}
              • Send notifications about your aquarium{'\n'}
              • Process subscription payments
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">3. Data Storage</Text>
            <Text className="text-slate-600 leading-6">
              Your data is stored securely using Supabase, which uses industry-standard encryption. 
              Photos are stored in secure cloud storage. We do not sell your personal data to third parties.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">4. Third-Party Services</Text>
            <Text className="text-slate-600 leading-6">
              We use the following third-party services:{'\n\n'}
              • Supabase (database and authentication){'\n'}
              • Stripe (web payment processing){'\n'}
              • Apple App Store (in-app purchases){'\n'}
              • RevenueCat (subscription management)
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">5. Your Rights</Text>
            <Text className="text-slate-600 leading-6">
              You have the right to:{'\n\n'}
              • Access your personal data{'\n'}
              • Delete your account and data{'\n'}
              • Export your data{'\n'}
              • Opt out of marketing communications
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">6. Data Retention</Text>
            <Text className="text-slate-600 leading-6">
              We retain your data as long as your account is active. When you delete your account, 
              your data is permanently removed within 30 days.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">7. Children's Privacy</Text>
            <Text className="text-slate-600 leading-6">
              AquaXone is not intended for children under 13. We do not knowingly collect 
              information from children under 13.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">8. Contact Us</Text>
            <Text className="text-slate-600 leading-6">
              If you have questions about this Privacy Policy, contact us at:{'\n\n'}
              support@aquaxone.app
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
