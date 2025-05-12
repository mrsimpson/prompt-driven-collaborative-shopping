import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Plus } from 'lucide-react-native';

// This is a placeholder component that will be replaced with real data
// from our Dexie.js store in the next implementation step
const MOCK_LISTS = [
  { id: '1', name: 'Grocery List', itemCount: 5 },
  { id: '2', name: 'Hardware Store', itemCount: 3 },
  { id: '3', name: 'Birthday Party', itemCount: 8 },
];

export default function ListsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Shopping Lists</Text>
        <Link href="/lists/new" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
      </View>

      <FlatList
        data={MOCK_LISTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/lists/${item.id}`} asChild>
            <TouchableOpacity style={styles.listItem}>
              <View>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listInfo}>{item.itemCount} items</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  listInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
});
