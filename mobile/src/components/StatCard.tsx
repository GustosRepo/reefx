import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  paramType?: string;
  warning?: boolean;
  danger?: boolean;
  onPress?: () => void;
}

const paramColors: Record<string, string> = {
  temp: '#f97316',
  salinity: '#3b82f6',
  alk: '#8b5cf6',
  ph: '#10b981',
  cal: '#06b6d4',
  mag: '#ec4899',
  po4: '#f59e0b',
  no3: '#ef4444',
  gh: '#6366f1',
  kh: '#8b5cf6',
  ammonia: '#dc2626',
  nitrite: '#ea580c',
  default: '#06b6d4',
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  paramType,
  warning,
  danger,
  onPress,
}: StatCardProps) {
  const accentColor = paramColors[paramType || 'default'];
  
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#64748b';

  const borderColor = danger 
    ? 'border-red-400' 
    : warning 
    ? 'border-yellow-400' 
    : 'border-aqua-200';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className={`bg-white rounded-2xl p-4 shadow-sm border ${borderColor}`}
      style={{ 
        shadowColor: accentColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-2xl">{icon}</Text>
        {(warning || danger) && (
          <View className={`w-2 h-2 rounded-full ${danger ? 'bg-red-500' : 'bg-yellow-500'}`} />
        )}
      </View>
      
      <Text className="text-slate-500 text-sm font-medium mb-1">{title}</Text>
      
      <View className="flex-row items-end justify-between">
        <Text 
          className="text-2xl font-bold"
          style={{ color: danger ? '#ef4444' : warning ? '#f59e0b' : colors.text.primary }}
        >
          {value}
        </Text>
        
        {trend && trendValue && (
          <View className="flex-row items-center">
            <Ionicons name={trendIcon as any} size={14} color={trendColor} />
            <Text className="text-xs ml-1" style={{ color: trendColor }}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default StatCard;
