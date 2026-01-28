import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTank, useAquaMode, REEF_PARAMETERS, FRESHWATER_PARAMETERS } from '@/context';
import { LoadingState, EmptyState } from '@/components';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { ParameterLog } from '@shared/types';

const screenWidth = Dimensions.get('window').width;

export default function HistoryScreen() {
  const { currentTank } = useTank();
  const { isReefMode, theme, modeIcon } = useAquaMode();

  const [logs, setLogs] = useState<ParameterLog[]>([]);
  const [selectedParam, setSelectedParam] = useState('temp');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parameters = isReefMode ? REEF_PARAMETERS : FRESHWATER_PARAMETERS;

  const loadHistory = useCallback(async () => {
    if (!currentTank) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reef_logs')
        .select('*')
        .eq('tank_id', currentTank.id)
        .order('log_date', { ascending: true })
        .limit(30);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentTank]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadHistory();
    setIsRefreshing(false);
  };

  const getChartData = () => {
    const filteredLogs = logs.filter(log => {
      const value = log[selectedParam as keyof ParameterLog];
      return value !== null && value !== undefined;
    });

    if (filteredLogs.length === 0) {
      return null;
    }

    const labels = filteredLogs.slice(-7).map(log => {
      const date = new Date(log.log_date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = filteredLogs.slice(-7).map(log => {
      const value = log[selectedParam as keyof ParameterLog];
      return typeof value === 'number' ? value : 0;
    });

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const selectedParamInfo = parameters.find(p => p.key === selectedParam);
  const chartData = getChartData();

  if (!currentTank) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.6} />
        <EmptyState
          icon="🐠"
          title="No Tank Selected"
          message="Please select a tank to view history"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.4} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.accentPrimary}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl mr-2">{modeIcon}</Text>
            <View>
              <Text className="text-2xl font-bold text-slate-800">History</Text>
              <Text className="text-slate-500">{currentTank.name}</Text>
            </View>
          </View>
        </View>

        {/* Parameter Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          {parameters.map((param) => (
            <TouchableOpacity
              key={param.key}
              onPress={() => setSelectedParam(param.key)}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedParam === param.key 
                  ? 'bg-aqua-600' 
                  : 'bg-white border border-aqua-200'
              }`}
              style={selectedParam === param.key ? { backgroundColor: theme.accentPrimary } : {}}
            >
              <View className="flex-row items-center">
                <Text className="mr-1">{param.icon}</Text>
                <Text className={selectedParam === param.key ? 'text-white font-semibold' : 'text-slate-700'}>
                  {param.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-2xl p-4 border border-aqua-200">
            <Text className="text-lg font-bold text-slate-800 mb-2">
              {selectedParamInfo?.label} Trend
            </Text>

            {isLoading ? (
              <View className="h-48 items-center justify-center">
                <LoadingState message="Loading chart..." />
              </View>
            ) : !chartData ? (
              <View className="h-48 items-center justify-center">
                <Text className="text-4xl mb-2">📊</Text>
                <Text className="text-slate-500 text-center">
                  No data for {selectedParamInfo?.label}
                </Text>
              </View>
            ) : (
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={200}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => selectedParamInfo?.color || theme.accentPrimary,
                  labelColor: (opacity = 1) => colors.text.muted,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: selectedParamInfo?.color || theme.accentPrimary,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            )}
          </View>
        </View>

        {/* Recent Logs */}
        <View className="px-4">
          <Text className="text-lg font-bold text-slate-800 mb-4">Recent Logs</Text>

          {logs.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-aqua-200">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-slate-800 font-semibold mb-1">No Logs Yet</Text>
              <Text className="text-slate-500 text-center text-sm">
                Start logging to see your history here
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {logs.slice(-10).reverse().map((log) => (
                <View
                  key={log.id}
                  className="bg-white rounded-xl p-4 border border-aqua-200"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-slate-800">
                      {new Date(log.log_date).toLocaleDateString()}
                    </Text>
                    <Ionicons name="document-text" size={16} color={colors.text.muted} />
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {parameters.map((param) => {
                      const value = log[param.key as keyof ParameterLog];
                      if (value === null || value === undefined) return null;
                      return (
                        <View 
                          key={param.key}
                          className="bg-slate-50 px-2 py-1 rounded"
                        >
                          <Text className="text-xs text-slate-500">{param.label}</Text>
                          <Text className="font-semibold" style={{ color: param.color }}>
                            {value}{param.unit ? ` ${param.unit}` : ''}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
