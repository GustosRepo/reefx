import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Image, View } from "react-native";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={{ alignItems: "center", marginTop: 10, marginBottom: 0 }}>
<Image
  source={require("../../assets/fulllogo.png")}
  style={{ width: 150, height: 75, resizeMode: "contain" }}
  onError={() => console.warn("❌ fulllogo.png failed to load")}
  accessibilityLabel="REEFX Logo"
/>
        </View>
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
            tabBarActiveTintColor: "#7df9ff",
            tabBarInactiveTintColor: "#999",
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#000",
              borderTopColor: "#333",
            },
            tabBarLabelStyle: {
              fontWeight: "600",
            },
          })}
        />
      </View>
    </>
  );
}