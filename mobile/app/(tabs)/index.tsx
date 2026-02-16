import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fetchThresholds, checkThresholds, getCachedThresholds, type ParameterWarning, type Thresholds, REEF_DEFAULTS } from '@/lib/thresholds';
import { useTank, useAquaMode, useAuth, REEF_PARAMETERS, FRESHWATER_PARAMETERS } from '@/context';
import { StatCard, TankSelector, EmptyState, LoadingState, GuestModeBanner } from '@/components';
import AquaticBackground from '@/components/AquaticBackground';
import { colors } from '@/constants/theme';
import { ParameterLog, MaintenanceEntry } from '@shared/types';
import { DEMO_LOGS, DEMO_MAINTENANCE } from '@/constants/demoData';

export default function DashboardScreen() {
  const { user, isGuestMode } = useAuth();
  const { tanks, currentTank, setCurrentTank, isLoading: tanksLoading } = useTank();
  const { isReefMode, theme, modeIcon } = useAquaMode();

  const [showTankSelector, setShowTankSelector] = useState(false);
  const [latestLog, setLatestLog] = useState<ParameterLog | null>(null);
  const [overdueMaintenance, setOverdueMaintenance] = useState<MaintenanceEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [paramWarnings, setParamWarnings] = useState<ParameterWarning[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>(REEF_DEFAULTS);

  const parameters = isReefMode ? REEF_PARAMETERS : FRESHWATER_PARAMETERS;

  const loadDashboardData = useCallback(async () => {
    if (!currentTank) {
      setIsLoadingData(false);
      return;
    }

    // Guest mode: use demo data
    if (isGuestMode) {
      setLatestLog(DEMO_LOGS[0]);
      const today = new Date().toISOString().split('T')[0];
      setOverdueMaintenance(
        DEMO_MAINTENANCE.filter(m => m.due_date < today && m.status === 'pending')
      );
      setIsLoadingData(false);
      return;
    }

    try {
      // Fetch latest parameter log
      const { data: logData, error: logError } = await supabase
        .from('reef_logs')
        .select('*')
        .eq('tank_id', currentTank.id)
        .order('log_date', { ascending: false })
        .limit(1)
        .single();

      if (!logError && logData) {
        setLatestLog(logData);

        // Check thresholds
        try {
          const userThresholds = user ? await fetchThresholds(user.id) : await getCachedThresholds();
          setThresholds(userThresholds);
          const paramKeys = parameters.map(p => p.key);
          const warnings = checkThresholds(logData, userThresholds, paramKeys);
          setParamWarnings(warnings);
        } catch {
          setParamWarnings([]);
        }
      } else {
        setLatestLog(null);
      }

      // Fetch overdue maintenance
      const today = new Date().toISOString().split('T')[0];
      const { data: maintData, error: maintError } = await supabase
        .from('maintenance')
        .select('*')
        .eq('tank_id', currentTank.id)
        .lt('due_date', today)
        .order('due_date', { ascending: true })
        .limit(5);

      if (!maintError && maintData) {
        setOverdueMaintenance(maintData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentTank]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const getParamValue = (key: string): string => {
    if (!latestLog) return '--';
    const value = latestLog[key as keyof ParameterLog];
    if (value === null || value === undefined) return '--';
    return String(value);
  };

  if (tanksLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.6} />
        <LoadingState message="Loading your tanks..." />
      </SafeAreaView>
    );
  }

  if (!currentTank) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <AquaticBackground mode="reef" opacity={0.8} />
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-28 h-28 rounded-full items-center justify-center mb-6" style={{ backgroundColor: `${theme.accentPrimary}20` }}>
            <Text className="text-6xl">🐠</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800 mb-2 text-center">
            Welcome to AquaXone!
          </Text>
          <Text className="text-slate-500 text-center mb-8 leading-6">
            Track your water parameters, schedule maintenance, and keep your aquarium thriving.
          </Text>
          
          <TouchableOpacity
            onPress={() => router.push('/tank/new')}
            className="w-full rounded-2xl py-4 items-center mb-4"
            style={{ backgroundColor: theme.accentPrimary }}
          >
            <View className="flex-row items-center">
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Create Your First Tank</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center mt-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="text-slate-400 px-4">What you can do</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <View className="mt-6 w-full gap-4">
            <View className="flex-row items-center bg-white rounded-xl p-4 border border-aqua-200">
              <Text className="text-2xl mr-3">📊</Text>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">Log Parameters</Text>
                <Text className="text-slate-500 text-sm">Track pH, temp, salinity & more</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-white rounded-xl p-4 border border-aqua-200">
              <Text className="text-2xl mr-3">📈</Text>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">View Trends</Text>
                <Text className="text-slate-500 text-sm">Charts & history at a glance</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-white rounded-xl p-4 border border-aqua-200">
              <Text className="text-2xl mr-3">🔧</Text>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">Maintenance Reminders</Text>
                <Text className="text-slate-500 text-sm">Never miss a water change</Text>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AquaticBackground mode={isReefMode ? 'reef' : 'freshwater'} opacity={0.5} />
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
        {/* Guest Mode Banner */}
        {isGuestMode && (
          <View className="px-4 pt-4">
            <GuestModeBanner message="You're exploring in demo mode. Create an account to start tracking your own aquarium!" />
          </View>
        )}

        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-slate-500 text-sm">{isGuestMode ? 'Exploring as' : 'Welcome back,'}</Text>
              <Text className="text-2xl font-bold text-slate-800">
                {isGuestMode ? 'Guest' : (user?.name || 'Aquarist')}
              </Text>
            </View>
            {/* Mode badge - read from tank type */}
            <View 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${theme.accentPrimary}20` }}
            >
              <Text style={{ color: theme.accentPrimary }} className="text-sm font-medium">
                {modeIcon} {isReefMode ? 'Reef' : 'Freshwater'}
              </Text>
            </View>
          </View>

          {/* Tank Selector */}
          <TouchableOpacity
            onPress={() => setShowTankSelector(true)}
            className="flex-row items-center bg-white rounded-2xl p-4 border"
            style={{ borderColor: `${theme.accentPrimary}40` }}
          >
            <Text className="text-2xl mr-3">{modeIcon}</Text>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs">Current Tank</Text>
              <Text className="text-lg font-bold text-slate-800">{currentTank.name}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={theme.accentPrimary} />
          </TouchableOpacity>
        </View>

        {/* Overdue Maintenance Alert */}
        {overdueMaintenance.length > 0 && (
          <View className="mx-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={20} color="#f59e0b" />
              <Text className="text-yellow-800 font-bold ml-2">
                Maintenance Overdue
              </Text>
            </View>
            <Text className="text-yellow-700 text-sm">
              You have {overdueMaintenance.length} overdue maintenance task(s)
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/maintenance')}
              className="mt-2"
            >
              <Text className="text-yellow-800 font-semibold">View Tasks →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Parameter Alerts */}
        {paramWarnings.length > 0 && (
          <View className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-800 font-bold ml-2">
                Parameter Alerts ({paramWarnings.length})
              </Text>
            </View>
            {paramWarnings.map((warning) => (
              <View key={warning.key} className="flex-row items-center mb-2">
                <View className={`w-2 h-2 rounded-full mr-2 ${warning.type === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <Text className="text-red-700 text-sm flex-1">
                  {warning.label}: {warning.value} — {warning.type === 'low' ? `below min (${warning.min})` : `above max (${warning.max})`}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => router.push('/thresholds')}
              className="mt-2"
            >
              <Text className="text-red-800 font-semibold">Configure Thresholds →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row px-4 mt-6 gap-3">
          <TouchableOpacity
            onPress={() => router.push('/log')}
            className="flex-1 bg-aqua-600 rounded-2xl p-4 items-center"
            style={{ backgroundColor: theme.accentPrimary }}
          >
            <Ionicons name="add-circle" size={28} color="white" />
            <Text className="text-white font-semibold mt-2">Log Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/history')}
            className="flex-1 bg-white rounded-2xl p-4 items-center border border-aqua-200"
          >
            <Ionicons name="bar-chart" size={28} color={theme.accentPrimary} />
            <Text className="text-slate-700 font-semibold mt-2">View History</Text>
          </TouchableOpacity>
        </View>

        {/* Parameters Section */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-slate-800">Parameters</Text>
            {latestLog && (
              <Text className="text-slate-500 text-sm">
                Last logged: {new Date(latestLog.log_date).toLocaleDateString()}
              </Text>
            )}
          </View>

          {isLoadingData ? (
            <LoadingState message="Loading parameters..." />
          ) : !latestLog ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-aqua-200">
              <Text className="text-4xl mb-3">📊</Text>
              <Text className="text-slate-800 font-semibold mb-1">No Data Yet</Text>
              <Text className="text-slate-500 text-center text-sm mb-4">
                Start logging your water parameters to see them here
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/log')}
                className="bg-aqua-600 rounded-xl py-2 px-4"
                style={{ backgroundColor: theme.accentPrimary }}
              >
                <Text className="text-white font-semibold">Log First Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {parameters.map((param) => {
                const warning = paramWarnings.find(w => w.key === param.key);
                return (
                  <View key={param.key} style={{ width: '48%' }}>
                    <StatCard
                      title={param.label}
                      value={`${getParamValue(param.key)}${param.unit ? ` ${param.unit}` : ''}`}
                      icon={param.icon}
                      paramType={param.key}
                      warning={!!warning}
                      danger={warning?.type === 'high'}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-slate-800 mb-4">Quick Links</Text>
          <View className="bg-white rounded-2xl border border-aqua-200 overflow-hidden">
            <TouchableOpacity
              onPress={() => router.push('/maintenance')}
              className="flex-row items-center p-4 border-b border-aqua-100"
            >
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-lg">🔧</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">Maintenance</Text>
                <Text className="text-slate-500 text-sm">Track tasks & schedules</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/more')}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                <Text className="text-lg">📸</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-slate-800">Gallery</Text>
                <Text className="text-slate-500 text-sm">Photos of your tank</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Tank Selector Modal */}
      <TankSelector
        tanks={tanks}
        currentTank={currentTank}
        visible={showTankSelector}
        onClose={() => setShowTankSelector(false)}
        onSelectTank={setCurrentTank}
      />
    </SafeAreaView>
  );
}
