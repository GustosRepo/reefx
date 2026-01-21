import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Image, View, Text, TouchableOpacity } from "react-native";
import AdBanner from "../../components/AdBanner";
import { AquaModeProvider, useAquaMode } from "../../context/AquaModeContext";
import { ModeIndicator } from "../../components/ModeSwitch";

function TabLayoutContent() {
  const { colors, modeIcon, mode } = useAquaMode();

  return (
    <>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Logo Header with Mode Indicator */}
        <View style={{ 
          alignItems: "center", 
          marginTop: 10, 
          marginBottom: 0,
          flexDirection: "row",
          justifyContent: "center",
          paddingHorizontal: 16,
        }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Image
              source={require("../../assets/fulllogo.png")}
              style={{ width: 150, height: 75, resizeMode: "contain" }}
              onError={() => console.warn("❌ fulllogo.png failed to load")}
              accessibilityLabel="AQUAXONE Logo"
            />
          </View>
          {/* Mode indicator in top right */}
          <View style={{ position: "absolute", right: 16, top: 25 }}>
            <ModeIndicator />
          </View>
        </View>

        {/* Tabs */}
        <Tabs
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName: React.ComponentProps<typeof Ionicons>["name"];

              if (route.name === "home") iconName = "home";
              else if (route.name === "log") iconName = "create";
              else if (route.name === "history") iconName = "time";
              else iconName = "alert";

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontWeight: "600",
            },
          })}
        />

        {/* Banner Ad */}
        <AdBanner />
      </View>
    </>
  );
}

export default function TabLayout() {
  return (
    <AquaModeProvider>
      <TabLayoutContent />
    </AquaModeProvider>
  );
}