import { View, Text, TouchableOpacity } from 'react-native';
import { useAquaMode } from '@/context';
import { colors } from '@/constants/theme';

export function ModeSwitch() {
  const { mode, toggleMode, modeIcon, modeLabel, theme } = useAquaMode();

  return (
    <TouchableOpacity
      onPress={toggleMode}
      className="flex-row items-center bg-white rounded-full px-4 py-2 border border-aqua-200"
      activeOpacity={0.7}
    >
      <Text className="text-lg mr-2">{modeIcon}</Text>
      <Text 
        className="font-semibold text-sm"
        style={{ color: theme.accentPrimary }}
      >
        {mode === 'reef' ? 'Reef' : 'Fresh'}
      </Text>
    </TouchableOpacity>
  );
}

export default ModeSwitch;
