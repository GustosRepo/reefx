import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context';
import { colors } from '@/constants/theme';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please enter your email and password',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords don\'t match',
        text2: 'Please make sure your passwords match',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak password',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, name);
    setIsLoading(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: error.message || 'Could not create account',
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Please check your email to verify your account',
      });
      router.replace('/(auth)/login');
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
              <Text className="text-3xl font-bold text-slate-800">Create Account</Text>
              <Text className="text-slate-500 mt-2">Start tracking your aquarium today</Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-slate-700 font-medium mb-2">Name (optional)</Text>
                <View className="flex-row items-center bg-white rounded-xl border border-aqua-200 px-4">
                  <Ionicons name="person-outline" size={20} color={colors.text.muted} />
                  <TextInput
                    className="flex-1 py-4 px-3 text-slate-800"
                    placeholder="Your name"
                    placeholderTextColor={colors.text.muted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </View>
              </View>

              <View className="mt-4">
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

              <View className="mt-4">
                <Text className="text-slate-700 font-medium mb-2">Password</Text>
                <View className="flex-row items-center bg-white rounded-xl border border-aqua-200 px-4">
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} />
                  <TextInput
                    className="flex-1 py-4 px-3 text-slate-800"
                    placeholder="Create a password"
                    placeholderTextColor={colors.text.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={colors.text.muted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mt-4">
                <Text className="text-slate-700 font-medium mb-2">Confirm Password</Text>
                <View className="flex-row items-center bg-white rounded-xl border border-aqua-200 px-4">
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} />
                  <TextInput
                    className="flex-1 py-4 px-3 text-slate-800"
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.text.muted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                  />
                </View>
              </View>

              <TouchableOpacity
                className="bg-aqua-600 rounded-xl py-4 items-center mt-6 shadow-md"
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-aqua-600 font-bold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
