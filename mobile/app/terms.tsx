import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function TermsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: 'Terms of Service', headerShown: true }} />
      
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-bold text-slate-800 mb-4">Terms of Service</Text>
        <Text className="text-slate-500 mb-6">Last updated: January 2026</Text>

        <View className="gap-6">
          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">1. Acceptance of Terms</Text>
            <Text className="text-slate-600 leading-6">
              By using AquaXone, you agree to these Terms of Service. If you do not agree, 
              please do not use the application.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">2. Description of Service</Text>
            <Text className="text-slate-600 leading-6">
              AquaXone is an aquarium management application that helps you track water parameters, 
              maintenance schedules, equipment, and livestock for your aquariums.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">3. User Accounts</Text>
            <Text className="text-slate-600 leading-6">
              You are responsible for:{'\n\n'}
              • Maintaining the confidentiality of your account{'\n'}
              • All activities that occur under your account{'\n'}
              • Providing accurate information{'\n'}
              • Notifying us of any unauthorized use
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">4. Subscriptions</Text>
            <Text className="text-slate-600 leading-6">
              Premium features require a paid subscription:{'\n\n'}
              • Subscriptions auto-renew unless cancelled{'\n'}
              • Cancel anytime through the App Store{'\n'}
              • No refunds for partial subscription periods{'\n'}
              • Prices may change with notice
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">5. Acceptable Use</Text>
            <Text className="text-slate-600 leading-6">
              You agree not to:{'\n\n'}
              • Use the service for illegal purposes{'\n'}
              • Upload malicious content{'\n'}
              • Attempt to access other users' data{'\n'}
              • Reverse engineer the application
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">6. Intellectual Property</Text>
            <Text className="text-slate-600 leading-6">
              AquaXone and its content are protected by copyright and other intellectual property laws. 
              You retain ownership of data you create within the app.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">7. Disclaimer</Text>
            <Text className="text-slate-600 leading-6">
              AquaXone is provided "as is" without warranties. We are not responsible for:{'\n\n'}
              • Decisions made based on app data{'\n'}
              • Loss of aquarium livestock{'\n'}
              • Data loss due to technical issues
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">8. Limitation of Liability</Text>
            <Text className="text-slate-600 leading-6">
              To the maximum extent permitted by law, AquaXone shall not be liable for any 
              indirect, incidental, special, or consequential damages.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">9. Termination</Text>
            <Text className="text-slate-600 leading-6">
              We may terminate or suspend your account at any time for violations of these terms. 
              You may delete your account at any time through the app settings.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">10. Changes to Terms</Text>
            <Text className="text-slate-600 leading-6">
              We may update these terms from time to time. Continued use after changes 
              constitutes acceptance of the new terms.
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-slate-800 mb-2">11. Contact</Text>
            <Text className="text-slate-600 leading-6">
              Questions about these terms? Contact us at:{'\n\n'}
              support@aquaxone.app
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
