import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth, useAquaMode, useTank } from '@/context';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { REEF_PARAMETERS, FRESHWATER_PARAMETERS } from '@/constants/app';
import {
  fetchThresholds,
  saveThresholds,
  Thresholds,
  REEF_DEFAULTS,
  FRESHWATER_DEFAULTS,
} from '@/lib/thresholds';

type ParamField = {
  key: string;
  label: string;
  unit: string;
};

export default function ThresholdsScreen() {
  const { user, isGuestMode } = useAuth();
  const { theme } = useAquaMode();
  const { currentTank } = useTank();
  const isReefMode = currentTank?.type !== 'freshwater';
  const defaults = isReefMode ? REEF_DEFAULTS : FRESHWATER_DEFAULTS;

  const [thresholds, setThresholds] = useState<Thresholds>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // Track raw text while actively editing to allow decimal input (e.g. "0.")
  const [editingFields, setEditingFields] = useState<Record<string, string>>({});

  // Build parameter list based on tank type
  const parameters: ParamField[] = (isReefMode ? REEF_PARAMETERS : FRESHWATER_PARAMETERS).map(
    (p) => ({ key: p.key, label: p.label, unit: p.unit })
  );

  useEffect(() => {
    loadThresholds();
  }, []);

  const loadThresholds = async () => {
    setLoading(true);
    try {
      if (user?.id && !isGuestMode) {
        const data = await fetchThresholds(user.id);
        setThresholds(data);
      } else {
        setThresholds(defaults);
      }
    } catch {
      setThresholds(defaults);
    }
    setLoading(false);
  };

  const handleChangeText = (key: string, field: 'min' | 'max', text: string) => {
    const editKey = `${key}_${field}`;
    // Allow empty, digits, and one decimal point
    if (text !== '' && !/^\d*\.?\d*$/.test(text)) return;
    setEditingFields((prev) => ({ ...prev, [editKey]: text }));
    setHasChanges(true);
  };

  const handleBlur = (key: string, field: 'min' | 'max') => {
    const editKey = `${key}_${field}`;
    const raw = editingFields[editKey];
    if (raw === undefined) return;
    const fieldKey = `${key}_${field}` as keyof Thresholds;
    const numValue = raw === '' ? 0 : parseFloat(raw);
    setThresholds((prev) => ({ ...prev, [fieldKey]: isNaN(numValue) ? 0 : numValue }));
    setEditingFields((prev) => {
      const next = { ...prev };
      delete next[editKey];
      return next;
    });
  };

  const handleFocus = (key: string, field: 'min' | 'max') => {
    const editKey = `${key}_${field}`;
    const fieldKey = `${key}_${field}` as keyof Thresholds;
    const val = thresholds[fieldKey];
    setEditingFields((prev) => ({ ...prev, [editKey]: val !== undefined && val !== null ? String(val) : '' }));
  };

  const getDisplayValue = (key: string, field: 'min' | 'max'): string => {
    const editKey = `${key}_${field}`;
    if (editKey in editingFields) return editingFields[editKey];
    const fieldKey = `${key}_${field}` as keyof Thresholds;
    const val = thresholds[fieldKey];
    if (val === undefined || val === null) return '';
    return String(val);
  };

  const handleSave = async () => {
    if (isGuestMode || !user?.id) {
      Toast.show({
        type: 'info',
        text1: 'Demo Mode',
        text2: 'Sign in to save custom thresholds',
      });
      return;
    }

    setSaving(true);
    const success = await saveThresholds(user.id, thresholds);
    setSaving(false);

    if (success) {
      setHasChanges(false);
      Toast.show({
        type: 'success',
        text1: 'Thresholds Saved',
        text2: 'Your parameter alerts have been updated',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Could not save thresholds. Try again.',
      });
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Defaults',
      `Reset all thresholds to ${isReefMode ? 'reef' : 'freshwater'} defaults?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setThresholds(defaults);
            setHasChanges(true);

            if (!isGuestMode && user?.id) {
              setSaving(true);
              await saveThresholds(user.id, defaults);
              setSaving(false);
              setHasChanges(false);
              Toast.show({
                type: 'success',
                text1: 'Thresholds Reset',
                text2: `Restored to ${isReefMode ? 'reef' : 'freshwater'} defaults`,
              });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={theme.accentPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-aqua-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-800">Parameter Thresholds</Text>
          <Text className="text-sm text-slate-500">
            {isReefMode ? 'Reef' : 'Freshwater'} tank alerts
          </Text>
        </View>
        {hasChanges && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: theme.accentPrimary }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Info Card */}
        <View className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row">
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text className="text-blue-700 text-sm ml-2 flex-1">
            Set min/max ranges for each parameter. You'll get notified when logged values fall
            outside these ranges.
          </Text>
        </View>

        {/* Parameter Rows */}
        <View className="px-4 mt-4">
          {/* Column Headers */}
          <View className="flex-row items-center mb-2 px-1">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-500">Parameter</Text>
            </View>
            <View className="w-24 items-center">
              <Text className="text-sm font-semibold text-slate-500">Min</Text>
            </View>
            <View className="w-24 items-center ml-2">
              <Text className="text-sm font-semibold text-slate-500">Max</Text>
            </View>
          </View>

          {parameters.map((param) => (
            <View
              key={param.key}
              className="flex-row items-center bg-white rounded-xl border border-aqua-200 p-3 mb-2"
            >
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">{param.label}</Text>
                {param.unit ? (
                  <Text className="text-xs text-slate-400">{param.unit}</Text>
                ) : null}
              </View>

              <TextInput
                className="w-24 h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-center text-slate-800"
                keyboardType="decimal-pad"
                value={getDisplayValue(param.key, 'min')}
                onChangeText={(text) => handleChangeText(param.key, 'min', text)}
                onFocus={() => handleFocus(param.key, 'min')}
                onBlur={() => handleBlur(param.key, 'min')}
                placeholder="Min"
                placeholderTextColor="#94a3b8"
              />

              <TextInput
                className="w-24 h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 text-center text-slate-800 ml-2"
                keyboardType="decimal-pad"
                value={getDisplayValue(param.key, 'max')}
                onChangeText={(text) => handleChangeText(param.key, 'max', text)}
                onFocus={() => handleFocus(param.key, 'max')}
                onBlur={() => handleBlur(param.key, 'max')}
                placeholder="Max"
                placeholderTextColor="#94a3b8"
              />
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="px-4 mt-6 gap-3">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !hasChanges}
            className={`flex-row items-center justify-center p-4 rounded-xl ${
              hasChanges ? '' : 'opacity-50'
            }`}
            style={{ backgroundColor: theme.accentPrimary }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">Save Thresholds</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            className="flex-row items-center justify-center p-4 rounded-xl bg-slate-100 border border-slate-200"
          >
            <Ionicons name="refresh" size={20} color="#64748b" />
            <Text className="text-slate-600 font-semibold ml-2">Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Guest Mode Note */}
        {isGuestMode && (
          <View className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <Text className="text-yellow-700 text-sm text-center">
              Sign in to save your custom thresholds and receive parameter alerts.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
