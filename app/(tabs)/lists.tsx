import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { layout, lists, typography, buttons, colors, headers } from '@/src/styles/common';
import { useShoppingLists } from '@/src/hooks';

export default function ListsScreen() {
  const { lists: shoppingLists, loading, error, refreshLists } = useShoppingLists();

  // Render loading state
  if (loading) {
    return (
      <View style={[layout.container, layout.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>Loading your lists...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[layout.container, layout.centered]}>
        <Text style={[typography.body, { color: colors.danger }]}>
          Failed to load shopping lists
        </Text>
        <TouchableOpacity 
          style={[buttons.secondary, { marginTop: 16 }]} 
          onPress={refreshLists}
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
        <Link href="/lists/new" asChild>
          <TouchableOpacity style={buttons.icon}>
            <Plus size={24} color={colors.white} />
          </TouchableOpacity>
        </Link>
      </View>

      {shoppingLists.length === 0 ? (
        <View style={[layout.centered, { flex: 1 }]}>
          <Text style={typography.body}>You don&apos;t have any shopping lists yet.</Text>
          <Link href="/lists/new" asChild>
            <TouchableOpacity style={[buttons.primary, { marginTop: 16 }]}>
              <Text style={typography.buttonText}>Create Your First List</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={shoppingLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Link href={`/lists/${item.id}`} asChild>
              <TouchableOpacity style={lists.item}>
                <View>
                  <Text style={typography.body}>{item.name}</Text>
                  <Text style={typography.bodySmall}>
                    {item.description ? item.description : 'No description'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          )}
          contentContainerStyle={lists.content}
          refreshing={loading}
          onRefresh={refreshLists}
        />
      )}
    </View>
  );
}
