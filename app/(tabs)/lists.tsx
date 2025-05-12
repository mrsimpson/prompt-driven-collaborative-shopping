import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { layout, lists, typography, buttons, colors, headers } from '@/src/styles/common';

// This is a placeholder component that will be replaced with real data
// from our Dexie.js store in the next implementation step
const MOCK_LISTS = [
  { id: '1', name: 'Grocery List', itemCount: 5 },
  { id: '2', name: 'Hardware Store', itemCount: 3 },
  { id: '3', name: 'Birthday Party', itemCount: 8 },
];

export default function ListsScreen() {
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

      <FlatList
        data={MOCK_LISTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/lists/${item.id}`} asChild>
            <TouchableOpacity style={lists.item}>
              <View>
                <Text style={typography.body}>{item.name}</Text>
                <Text style={typography.bodySmall}>{item.itemCount} items</Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={lists.content}
      />
    </View>
  );
}
