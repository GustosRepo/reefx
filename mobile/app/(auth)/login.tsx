import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context';
import { colors, modeThemes } from '@/constants/theme';
import Toast from 'react-native-toast-message';
import AquaticBackground from '@/components/AquaticBackground';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please enter your email and password',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: error.message || 'Invalid email or password',
      });
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AquaticBackground mode="reef" opacity={0.7} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Logo */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 rounded-3xl items-center justify-center mb-4 shadow-lg" style={{ backgroundColor: modeThemes.reef.accentPrimary }}>
                <Text className="text-white text-4xl font-bold">AX</Text>
              </View>
              <Text className="text-3xl font-bold text-slate-800">AquaXone</Text>
              <Text className="text-slate-500 mt-1">Smart Aquarium Tracking</Text>
            </View>

            {/* Form */}
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

              <View className="mt-4">
                <Text className="text-slate-700 font-medium mb-2">Password</Text>
                <View className="flex-row items-center bg-white rounded-xl border border-aqua-200 px-4">
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} />
                  <TextInput
                    className="flex-1 py-4 px-3 text-slate-800"
                    placeholder="Enter your password"
                    placeholderTextColor={colors.text.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
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

              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity className="self-end mt-2">
                  <Text className="font-medium" style={{ color: modeThemes.reef.accentPrimary }}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity
                className="rounded-xl py-4 items-center mt-6 shadow-md"
                style={{ backgroundColor: modeThemes.reef.accentPrimary }}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Register link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-500">Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="font-bold" style={{ color: modeThemes.reef.accentPrimary }}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
