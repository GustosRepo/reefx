import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tank } from '@shared/types';
import { colors } from '@/constants/theme';
import { useAquaMode } from '@/context';

interface TankSelectorProps {
  tanks: Tank[];
  currentTank: Tank | null;
  visible: boolean;
  onClose: () => void;
  onSelectTank: (tank: Tank) => void;
}

export function TankSelector({
  tanks,
  currentTank,
  visible,
  onClose,
  onSelectTank,
}: TankSelectorProps) {
  const { theme } = useAquaMode();

  const renderTank = ({ item }: { item: Tank }) => {
    const isSelected = currentTank?.id === item.id;
    const modeIcon = item.type === 'freshwater' ? '🌿' : '🪸';
    // Get the accent color based on the tank's type
    const tankAccent = item.type === 'freshwater' ? '#059669' : '#0891b2';

    return (
      <TouchableOpacity
        onPress={() => {
          onSelectTank(item);
          onClose();
        }}
        className={`flex-row items-center p-4 rounded-xl mb-2 bg-white`}
        style={isSelected ? { 
          backgroundColor: `${tankAccent}15`,
          borderWidth: 2,
          borderColor: tankAccent 
        } : { 
          borderWidth: 1,
          borderColor: '#e2e8f0' 
        }}
      >
        <Text className="text-2xl mr-3">{modeIcon}</Text>
        <View className="flex-1">
          <Text 
            className="font-semibold"
            style={{ color: isSelected ? tankAccent : colors.text.primary }}
          >
            {item.name}
          </Text>
          {item.size_gallons && (
            <Text className="text-slate-500 text-sm">{item.size_gallons} gallons</Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={tankAccent} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl p-6 max-h-[70%]">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-slate-800">Select Tank</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {tanks.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-4">🐠</Text>
              <Text className="text-slate-500 text-center">
                No tanks yet. Create your first tank to get started!
              </Text>
            </View>
          ) : (
            <FlatList
              data={tanks}
              renderItem={renderTank}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export default TankSelector;
