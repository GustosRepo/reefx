// New Supabase-based authentication utilities
import { createClient } from '@/utils/supabase/client';
import type { TempUnit, VolumeUnit } from './conversions';

export interface User {
  id: string;
  email: string;
  name: string;
  temp_unit: TempUnit;
  volume_unit: VolumeUnit;
}

// Get current user from Supabase session
export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    temp_unit: profile.temp_unit || 'fahrenheit',
    volume_unit: profile.volume_unit || 'gallons',
  };
};

// Check if user is authenticated (client-side)
export const isAuthenticated = async (): Promise<boolean> => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Register new user
export const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // This gets passed to handle_new_user() trigger
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Registration failed' };
  }

  return { success: true };
};

// Login user
export const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Login failed' };
  }

  return { success: true };
};

// Logout user
export const logout = async (): Promise<void> => {
  const supabase = createClient();
  await supabase.auth.signOut();
  // Clear subscription cache
  localStorage.removeItem('reefx_subscription');
};

// Update user profile
export const updateProfile = async (name: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Delete user account
export const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Delete user (cascades to all related data via ON DELETE CASCADE)
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Update password
export const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Update unit preferences
export const updateUnitPreferences = async (
  tempUnit: TempUnit,
  volumeUnit: VolumeUnit
): Promise<{ success: boolean; error?: string }> => {
  const supabase = createClient();
  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      temp_unit: tempUnit,
      volume_unit: volumeUnit,
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};
