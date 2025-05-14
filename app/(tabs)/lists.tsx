import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import {
  layout,
  lists,
  typography,
  buttons,
  colors,
  headers,
} from "@/src/styles/common";
import { useShoppingLists } from "@/src/hooks";

export default function ListsScreen() {
  const {
    lists: shoppingLists,
    loading,
    error,
    fetchLists,
  } = useShoppingLists();

  // Render loading state
  if (loading) {
    return (
      <View style={[layout.container, layout.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>
          Loading your lists...
        </Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[layout.container, layout.center]}>
        <Text style={[typography.body, { color: colors.danger }]}>
          Failed to load shopping lists
        </Text>
        <TouchableOpacity
          style={[buttons.secondary, { marginTop: 16 }]}
          onPress={fetchLists}
        >
          <Text style={typography.buttonTextSecondary}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={layout.container}>
      <View style={headers.container}>
        <View style={headers.titleContainer}>
          <Text style={typography.title}>My Shopping Lists</Text>
        </View>
        <TouchableOpacity
          style={buttons.icon}
          onPress={() => router.push("/lists/new")}
        >
          <Plus size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {shoppingLists.length === 0 ? (
        <View style={[layout.center, { flex: 1 }]}>
          <Text style={typography.body}>
            You don&apos;t have any shopping lists yet.
          </Text>
          <TouchableOpacity
            style={[buttons.primary, { marginTop: 16 }]}
            onPress={() => router.push("/lists/new")}
          >
            <Text style={typography.buttonText}>Create Your First List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shoppingLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={lists.item}
              onPress={() => router.push(`/lists/${item.id}`)}
            >
              <View>
                <Text style={typography.body}>{item.name}</Text>
                <Text style={typography.bodySmall}>
                  {item.description ? item.description : "No description"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={lists.content}
          refreshing={loading}
          onRefresh={fetchLists}
        />
      )}
    </View>
  );
}
