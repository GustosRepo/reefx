import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="light" />
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
    </>
  );
}