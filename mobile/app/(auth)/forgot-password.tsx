import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context';
import { colors, modeThemes } from '@/constants/theme';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Missing email',
        text2: 'Please enter your email address',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Reset failed',
        text2: error.message || 'Could not send reset email',
      });
    } else {
      setIsEmailSent(true);
      Toast.show({
        type: 'success',
        text1: 'Email sent!',
        text2: 'Check your inbox for reset instructions',
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8 pb-8">
            {/* Back button */}
            <TouchableOpacity 
              onPress={() => router.back()}
              className="flex-row items-center mb-6"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
              <Text className="text-slate-700 ml-2 font-medium">Back</Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-slate-800">Reset Password</Text>
              <Text className="text-slate-500 mt-2">
                Enter your email and we'll send you instructions to reset your password
              </Text>
            </View>

            {isEmailSent ? (
              // Success state
              <View className="items-center py-12">
                <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-6">
                  <Ionicons name="mail" size={40} color="#22c55e" />
                </View>
                <Text className="text-xl font-bold text-slate-800 mb-2">Check your email</Text>
                <Text className="text-slate-500 text-center mb-8">
                  We've sent password reset instructions to {email}
                </Text>
                <TouchableOpacity
                  className="rounded-xl py-4 px-8"
                  style={{ backgroundColor: modeThemes.reef.accentPrimary }}
                  onPress={() => router.replace('/(auth)/login')}
                >
                  <Text className="text-white font-bold text-lg">Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Form
              <View className="space-y-4">
                <View>
                  <Text className="text-slate-700 font-medium mb-2">Email</Text>
                  <View className="flex-row items-center bg-white rounded-xl border border-aqua-200 px-4">
                    <Ionicons name="mail-outline" size={20} color={colors.text.muted} />
                    <TextInput
                      className="flex-1 py-4 px-3 text-slate-800"
                      placeholder="Enter your email"
                      placeholderTextColor={colors.text.muted}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  className="rounded-xl py-4 items-center mt-6 shadow-md"
                  style={{ backgroundColor: modeThemes.reef.accentPrimary }}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
