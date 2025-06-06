import { Tabs } from "expo-router";
import { Chrome as Home, ShoppingCart, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          elevation: 0,
          boxShadow: "0px -1px 4px rgba(0, 0, 0, 0.1)",
          borderTopWidth: 1,
          borderTopColor: "rgba(0, 0, 0, 0.05)",
          backgroundColor: "#FFFFFF",
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "My Lists",
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
