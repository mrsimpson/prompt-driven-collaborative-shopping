import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/src/contexts/AuthContext";

export const LocalModeHeader: React.FC = () => {
  const { isLocalMode } = useAuth();

  if (!isLocalMode) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Local Mode - Your data is stored only on this device
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF3C7", // Light amber color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F59E0B", // Amber border
    alignItems: "center",
  },
  text: {
    color: "#92400E", // Dark amber text
    fontSize: 12,
    fontWeight: "500",
  },
});
