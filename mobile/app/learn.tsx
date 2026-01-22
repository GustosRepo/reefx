import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { useAquaMode } from '@/context';

const ARTICLES = [
  {
    id: 'nitrogen-cycle',
    title: 'The Nitrogen Cycle',
    description: 'Understanding the foundation of a healthy aquarium',
    icon: '🔄',
    category: 'Basics',
  },
  {
    id: 'water-changes',
    title: 'Water Changes',
    description: 'How often and how much to change',
    icon: '💧',
    category: 'Maintenance',
  },
  {
    id: 'reef-parameters',
    title: 'Reef Parameters Guide',
    description: 'Ideal ranges for saltwater tanks',
    icon: '🪸',
    category: 'Reef',
  },
  {
    id: 'freshwater-parameters',
    title: 'Freshwater Parameters',
    description: 'Ideal ranges for planted tanks',
    icon: '🌿',
    category: 'Freshwater',
  },
  {
    id: 'lighting',
    title: 'Aquarium Lighting',
    description: 'Choosing the right lights for your tank',
    icon: '💡',
    category: 'Equipment',
  },
  {
    id: 'filtration',
    title: 'Filtration 101',
    description: 'Types and best practices',
    icon: '🔧',
    category: 'Equipment',
  },
];

export default function LearnScreen() {
  const { isReefMode } = useAquaMode();

  const filteredArticles = ARTICLES.filter(article => {
    if (isReefMode && article.category === 'Freshwater') return false;
    if (!isReefMode && article.category === 'Reef') return false;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: 'Learn', headerShown: true }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-slate-800 mb-2">Guides & Articles</Text>
        <Text className="text-slate-500 mb-6">
          Learn best practices for aquarium keeping
        </Text>

        <View className="gap-3">
          {filteredArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              className="bg-white rounded-xl p-4 border border-aqua-200"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-aqua-100 items-center justify-center mr-3">
                  <Text className="text-2xl">{article.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-800">{article.title}</Text>
                  <Text className="text-slate-500 text-sm">{article.description}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="bg-slate-100 px-2 py-0.5 rounded">
                      <Text className="text-slate-500 text-xs">{article.category}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
