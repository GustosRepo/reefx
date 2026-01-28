import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAquaMode, useTank } from '@/context';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: 'How do I add a new tank?',
    answer: 'Go to the More tab, scroll down to "Your Tanks" section, and tap "Add New Tank". Follow the setup wizard to configure your tank.',
  },
  {
    question: 'What parameters should I track?',
    answer: 'For reef tanks: Temperature, Salinity, pH, Alkalinity, Calcium, Magnesium, Nitrate, and Phosphate. For freshwater: Temperature, pH, Ammonia, Nitrite, Nitrate, and GH/KH.',
  },
  {
    question: 'How do I upgrade my subscription?',
    answer: 'Go to More > Subscription to view available plans. Premium unlocks unlimited tanks, gallery, equipment tracking, and more features.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes! Premium users can export their parameter history as CSV files. Go to History > Export to download your data.',
  },
  {
    question: 'How do parameter alerts work?',
    answer: 'Set custom thresholds for each parameter. When a logged value falls outside your safe range, you\'ll receive a notification.',
  },
  {
    question: 'Is my data backed up?',
    answer: 'Yes, all your data is securely stored in the cloud and synced across devices. You can access your tanks from any device.',
  },
];

export default function HelpScreen() {
  const { theme } = useAquaMode();
  const { currentTank } = useTank();
  const isReefMode = currentTank?.type !== 'freshwater';

  const handleContact = (method: 'email' | 'website') => {
    if (method === 'email') {
      Linking.openURL('mailto:support@aquaxone.com');
    } else {
      Linking.openURL('https://aquaxone.com/support');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-aqua-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Help & Support</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Contact Options */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            onPress={() => handleContact('email')}
            className="flex-1 rounded-xl p-4 mr-2 items-center"
            style={{ backgroundColor: theme.accentPrimary }}
          >
            <Ionicons name="mail-outline" size={24} color="white" />
            <Text className="text-white font-semibold mt-2">Email Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleContact('website')}
            className="flex-1 bg-white border border-aqua-200 rounded-xl p-4 ml-2 items-center"
          >
            <Ionicons name="globe-outline" size={24} color={theme.accentPrimary} />
            <Text className="font-semibold mt-2" style={{ color: theme.accentPrimary }}>Help Center</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text className="text-lg font-bold text-slate-800 mb-3">
          Frequently Asked Questions
        </Text>

        {faqs.map((faq, index) => (
          <View
            key={index}
            className="bg-white rounded-xl p-4 mb-3 border border-aqua-200"
          >
            <View className="flex-row items-start">
              <View className="w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: `${theme.accentPrimary}20` }}>
                <Text className="font-bold text-sm" style={{ color: theme.accentPrimary }}>?</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800 mb-2">{faq.question}</Text>
                <Text className="text-slate-600 leading-5">{faq.answer}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Quick Links */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-slate-800 mb-3">Quick Links</Text>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://aquaxone.com/terms')}
            className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-aqua-200"
          >
            <Ionicons name="document-text-outline" size={20} color={colors.text.muted} />
            <Text className="flex-1 ml-3 text-slate-700">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://aquaxone.com/privacy')}
            className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-aqua-200"
          >
            <Ionicons name="shield-outline" size={20} color={colors.text.muted} />
            <Text className="flex-1 ml-3 text-slate-700">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://aquaxone.com')}
            className="flex-row items-center bg-white rounded-xl p-4 mb-3 border border-aqua-200"
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.text.muted} />
            <Text className="flex-1 ml-3 text-slate-700">About AquaXone</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View className="items-center mt-6 mb-8">
          <Text className="text-slate-400 text-sm">AquaXone v1.0.0</Text>
          <Text className="text-slate-300 text-xs mt-1">© 2025 AquaXone</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
