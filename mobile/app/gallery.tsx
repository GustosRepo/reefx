import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ImageViewing from 'react-native-image-viewing';
import { supabase } from '@/lib/supabase';
import { useTank, useAuth, useSubscription, useAquaMode } from '@/context';
import { LoadingState, EmptyState } from '@/components';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { GalleryImage } from '@shared/types';
import Toast from 'react-native-toast-message';

export default function GalleryScreen() {
  const { user } = useAuth();
  const { currentTank } = useTank();
  const { features } = useSubscription();
  const { theme } = useAquaMode();
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  // Convert images to format expected by ImageViewing
  const imageUrls = useMemo(() => 
    images.map(img => ({ uri: img.url })), 
    [images]
  );

  const loadImages = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Get photos for current tank OR photos not assigned to any tank (user's general photos)
      let query = supabase
        .from('gallery_photos')
        .select('*')
        .eq('user_id', user.id);
      
      if (currentTank) {
        // Get photos for this tank OR unassigned photos
        query = query.or(`tank_id.eq.${currentTank.id},tank_id.is.null`);
      } else {
        // No tank selected, show all user's photos
        query = query;
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentTank, user]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const onRefresh = () => {
    setRefreshing(true);
    loadImages();
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (uri: string, imageCaption?: string) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      // Get the file extension
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      // Fetch the image and convert to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for Supabase
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('gallery-photos')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(filePath);

      // Calculate file size in MB
      const fileSizeMB = blob.size / (1024 * 1024);

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_photos')
        .insert({
          user_id: user.id,
          tank_id: currentTank?.id || null,
          storage_path: filePath,
          url: urlData.publicUrl,
          file_size_mb: parseFloat(fileSizeMB.toFixed(4)),
          caption: imageCaption?.trim() || null,
        });

      if (dbError) throw dbError;

      Toast.show({
        type: 'success',
        text1: 'Photo uploaded!',
        text2: 'Your photo has been added to the gallery',
      });

      // Refresh the gallery
      loadImages();
    } catch (error: any) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: error.message || 'Could not upload photo',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingImageUri(result.assets[0].uri);
      setCaption('');
      setShowCaptionModal(true);
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
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingImageUri(result.assets[0].uri);
      setCaption('');
      setShowCaptionModal(true);
    }
  };

  const handleUploadWithCaption = async () => {
    if (!pendingImageUri) return;
    setShowCaptionModal(false);
    await uploadImage(pendingImageUri, caption);
    setPendingImageUri(null);
    setCaption('');
  };

  const handleDeletePhoto = (image: GalleryImage) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from storage
              const { error: storageError } = await supabase.storage
                .from('gallery-photos')
                .remove([image.storage_path]);
              
              if (storageError) console.error('Storage delete error:', storageError);

              // Delete from database
              const { error: dbError } = await supabase
                .from('gallery_photos')
                .delete()
                .eq('id', image.id);

              if (dbError) throw dbError;

              Toast.show({ type: 'success', text1: 'Photo deleted' });
              loadImages();
            } catch (error: any) {
              Toast.show({ type: 'error', text1: 'Error', text2: error.message });
            }
          },
        },
      ]
    );
  };

  const isReefMode = currentTank?.type !== 'freshwater';

  if (!features.gallery) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.5} />
        <Stack.Screen options={{ title: 'Gallery', headerShown: true }} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-6xl mb-4">🔒</Text>
          <Text className="text-xl font-bold text-slate-800 mb-2">Premium Feature</Text>
          <Text className="text-slate-500 text-center mb-6">
            Upgrade to Premium to access the Gallery feature
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/subscription')}
            className="rounded-xl py-3 px-6"
            style={{ backgroundColor: theme.accentPrimary }}
          >
            <Text className="text-white font-bold">Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      <Stack.Screen options={{ title: 'Gallery', headerShown: true }} />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accentPrimary} />
        }
      >
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
            {images.map((image, index) => (
              <TouchableOpacity 
                key={image.id} 
                className="w-[48%] aspect-square rounded-xl overflow-hidden bg-slate-200"
                onPress={() => {
                  setViewerIndex(index);
                  setIsViewerOpen(true);
                }}
                onLongPress={() => handleDeletePhoto(image)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: image.url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
                {image.caption && (
                  <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <Text className="text-white text-xs" numberOfLines={1}>{image.caption}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Upload Loading Overlay */}
      {isUploading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
          <View className="bg-white rounded-2xl p-6 items-center mx-8">
            <ActivityIndicator size="large" color={theme.accentPrimary} />
            <Text className="text-lg font-semibold text-slate-800 mt-4">Uploading...</Text>
            <Text className="text-slate-500 text-sm mt-1">Please wait</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="absolute bottom-6 right-6 gap-3">
        <TouchableOpacity
          onPress={takePhoto}
          disabled={isUploading}
          className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg border border-aqua-200"
          style={{ opacity: isUploading ? 0.5 : 1 }}
        >
          <Ionicons name="camera" size={24} color={theme.accentPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pickImage}
          disabled={isUploading}
          className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: theme.accentPrimary, opacity: isUploading ? 0.5 : 1 }}
        >
          <Ionicons name="images" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* Full Screen Photo Viewer */}
      <ImageViewing
        images={imageUrls}
        imageIndex={viewerIndex}
        visible={isViewerOpen}
        onRequestClose={() => setIsViewerOpen(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        FooterComponent={({ imageIndex }) => {
          const image = images[imageIndex];
          if (!image) return null;
          return (
            <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
              {image.caption && (
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                  {image.caption}
                </Text>
              )}
              {image.tags && image.tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {image.tags.map((tag, idx) => (
                    <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                      <Text style={{ color: 'white', fontSize: 14 }}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                {new Date(image.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          );
        }}
      />

      {/* Caption Modal */}
      <Modal visible={showCaptionModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 340 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 16 }}>Add Caption</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Describe this photo..."
              placeholderTextColor="#94a3b8"
              multiline
              style={{
                backgroundColor: '#f8fafc',
                borderWidth: 1,
                borderColor: '#e2e8f0',
                borderRadius: 12,
                padding: 12,
                minHeight: 80,
                textAlignVertical: 'top',
                color: '#1e293b',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => { setShowCaptionModal(false); setPendingImageUri(null); }}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#f1f5f9' }}
              >
                <Text style={{ textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUploadWithCaption}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: theme.accentPrimary }}
              >
                <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
