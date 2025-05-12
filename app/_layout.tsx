import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "@/src/hooks/useFrameworkReady";
import { AppProvider } from "@/src/app";
import { LocalModeHeader } from "@/src/components/LocalModeHeader";
import { View } from "react-native";

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <LocalModeHeader />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </AppProvider>
  );
}
