import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTank, useAquaMode, useAuth, REEF_PARAMETERS, FRESHWATER_PARAMETERS } from '@/context';
import AquaticBackground from '@/components/AquaticBackground';
import { CreateAccountPrompt } from '@/components';
import { colors } from '@/constants/theme';
import Toast from 'react-native-toast-message';

interface FormData {
  [key: string]: string;
}

export default function LogScreen() {
  const { user, isGuestMode } = useAuth();
  const { currentTank } = useTank();
  const { isReefMode, theme, modeIcon } = useAquaMode();
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  const parameters = isReefMode ? REEF_PARAMETERS : FRESHWATER_PARAMETERS;

  const [formData, setFormData] = useState<FormData>(() => {
    const initial: FormData = { date: new Date().toISOString().split('T')[0] };
    parameters.forEach(p => { initial[p.key] = ''; });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (isGuestMode) {
      setShowAccountPrompt(true);
      return;
    }

    if (!currentTank || !user) {
      Toast.show({
        type: 'error',
        text1: 'No tank selected',
        text2: 'Please select a tank first',
      });
      return;
    }

    // Check if at least one parameter is filled
    const hasData = parameters.some(p => formData[p.key] && formData[p.key].trim() !== '');
    if (!hasData) {
      Toast.show({
        type: 'error',
        text1: 'No data entered',
        text2: 'Please enter at least one parameter',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build the log entry
      const logEntry: any = {
        tank_id: currentTank.id,
        user_id: user.id,
        log_date: formData.date,
      };

      // Add non-empty parameters
      parameters.forEach(p => {
        const value = formData[p.key];
        if (value && value.trim() !== '') {
          logEntry[p.key] = parseFloat(value);
        }
      });

      const { error } = await supabase
        .from('reef_logs')
        .insert(logEntry);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Log saved!',
        text2: 'Your parameters have been recorded',
      });

      // Reset form
      const reset: FormData = { date: new Date().toISOString().split('T')[0] };
      parameters.forEach(p => { reset[p.key] = ''; });
      setFormData(reset);

      // Navigate back to dashboard
      router.push('/(tabs)');
    } catch (error: any) {
      console.error('Error saving log:', error);
      Toast.show({
        type: 'error',
        text1: 'Save failed',
        text2: error.message || 'Could not save log entry',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTank) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.6} />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-4xl mb-4">🐠</Text>
          <Text className="text-lg font-semibold text-slate-800 mb-2">No Tank Selected</Text>
          <Text className="text-slate-500 text-center">
            Please select or create a tank first
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-2">{modeIcon}</Text>
              <View>
                <Text className="text-2xl font-bold text-slate-800">Log Entry</Text>
                <Text className="text-slate-500">{currentTank.name}</Text>
              </View>
            </View>

            {/* Date Picker */}
            <View className="bg-white rounded-2xl p-4 border border-aqua-200 mb-4">
              <Text className="text-slate-500 text-sm mb-2">Date</Text>
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color={theme.accentPrimary} />
                <TextInput
                  className="flex-1 ml-3 text-slate-800 text-lg"
                  value={formData.date}
                  onChangeText={(value) => updateField('date', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.text.muted}
                />
              </View>
            </View>
          </View>

          {/* Parameters Form */}
          <View className="px-4">
            <Text className="text-lg font-bold text-slate-800 mb-4">
              {isReefMode ? 'Reef Parameters' : 'Freshwater Parameters'}
            </Text>

            <View className="gap-3">
              {parameters.map((param) => (
                <View 
                  key={param.key}
                  className="bg-white rounded-2xl p-4 border border-aqua-200"
                >
                  <View className="flex-row items-center mb-2">
                    <Text className="text-xl mr-2">{param.icon}</Text>
                    <Text className="text-slate-700 font-medium">{param.label}</Text>
                    {param.unit && (
                      <Text className="text-slate-400 ml-1">({param.unit})</Text>
                    )}
                  </View>
                  <TextInput
                    className="text-2xl font-bold text-slate-800"
                    value={formData[param.key]}
                    onChangeText={(value) => updateField(param.key, value)}
                    placeholder="--"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="decimal-pad"
                    style={{ color: param.color }}
                  />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-aqua-200">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="rounded-2xl py-4 items-center"
            style={{ backgroundColor: theme.accentPrimary }}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <Text className="text-white font-bold text-lg">Saving...</Text>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Save Log Entry</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CreateAccountPrompt
        visible={showAccountPrompt}
        onClose={() => setShowAccountPrompt(false)}
        title="Save Your Water Tests"
        message="Create a free account to log water parameters, track trends over time, and get alerts when levels are off."
      />
    </SafeAreaView>
  );
}
