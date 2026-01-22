import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useTank, useAuth, useSubscription } from '@/context';
import { LoadingState, EmptyState } from '@/components';
import { colors } from '@/constants/theme';
import { GalleryImage } from '@shared/types';
import Toast from 'react-native-toast-message';

export default function GalleryScreen() {
  const { user } = useAuth();
  const { currentTank } = useTank();
  const { features } = useSubscription();
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadImages = useCallback(async () => {
    if (!currentTank) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('tank_id', currentTank.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTank]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Upload to Supabase storage
      Toast.show({
        type: 'info',
        text1: 'Coming soon',
        text2: 'Image upload will be available soon',
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission denied',
        text2: 'Camera access is required to take photos',
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Upload to Supabase storage
      Toast.show({
        type: 'info',
        text1: 'Coming soon',
        text2: 'Image upload will be available soon',
      });
    }
  };

  if (!features.gallery) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Gallery', headerShown: true }} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-slate-800 mb-2">Premium Feature</Text>
          <Text className="text-slate-500 text-center mb-6">
            Upgrade to Premium to access the Gallery feature
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/subscription')}
            className="bg-aqua-600 rounded-xl py-3 px-6"
          >
            <Text className="text-white font-bold">Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: 'Gallery', headerShown: true }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <LoadingState message="Loading gallery..." />
        ) : images.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">📸</Text>
            <Text className="text-xl font-bold text-slate-800 mb-2">No Photos Yet</Text>
            <Text className="text-slate-500 text-center mb-6">
              Capture memories of your aquarium
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {images.map((image) => (
              <View key={image.id} className="w-[48%] aspect-square rounded-xl overflow-hidden">
                <Image
                  source={{ uri: image.storage_path }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-6 right-6 gap-3">
        <TouchableOpacity
          onPress={takePhoto}
          className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg border border-aqua-200"
        >
          <Ionicons name="camera" size={24} color={colors.brand.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pickImage}
          className="w-14 h-14 rounded-full bg-aqua-600 items-center justify-center shadow-lg"
          style={{ backgroundColor: colors.brand.primary }}
        >
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
