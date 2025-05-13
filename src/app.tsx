import React, { ReactNode } from "react";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { useAppInitialization } from "@/src/hooks/useAppInitialization";
import { View, Text, ActivityIndicator } from "react-native";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isInitialized, error } = useAppInitialization();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", marginBottom: 10 }}>
          Failed to initialize app
        </Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Initializing app...</Text>
      </View>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
};
