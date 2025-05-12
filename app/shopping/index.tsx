import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';

// Mock data - will be replaced with actual data from Dexie.js
const MOCK_LISTS = [
  { id: '1', name: 'Grocery List', itemCount: 5, selected: false },
  { id: '2', name: 'Hardware Store', itemCount: 3, selected: false },
  { id: '3', name: 'Birthday Party', itemCount: 8, selected: false },
];

export default function ShoppingModeScreen() {
  const [lists, setLists] = useState(MOCK_LISTS);
  
  const toggleListSelection = (id: string) => {
    setLists(lists.map(list => 
      list.id === id ? { ...list, selected: !list.selected } : list
    ));
  };
  
  const startShopping = () => {
    const selectedLists = lists.filter(list => list.selected);
    if (selectedLists.length === 0) {
      // Show error - would use a proper alert/toast in a real implementation
      console.log('Please select at least one list');
      return;
    }
    
    // In a real implementation, this would create a shopping session
    // with the selected lists using our ShoppingSessionService
    console.log('Starting shopping with lists:', selectedLists.map(l => l.id));
    
    // Navigate to the shopping session screen
    router.push('/shopping/session');
  };
  
  return (
    <View style={styles.container}>
      <HeaderWithBack 
        title="Shopping Mode"
        backTo="/"
        backTitle="Home"
      />
      
      <View style={styles.content}>
        <Text style={styles.subtitle}>Select lists to shop with:</Text>
        
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.listItem,
                item.selected && styles.listItemSelected
              ]}
              onPress={() => toggleListSelection(item.id)}
            >
              <View style={styles.listInfo}>
                <Text style={[
                  styles.listName,
                  item.selected && styles.listNameSelected
                ]}>
                  {item.name}
                </Text>
                <Text style={[
                  styles.listCount,
                  item.selected && styles.listCountSelected
                ]}>
                  {item.itemCount} items
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                item.selected && styles.checkboxSelected
              ]} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
        
        <TouchableOpacity 
          style={[
            styles.startButton,
            !lists.some(l => l.selected) && styles.startButtonDisabled
          ]}
          onPress={startShopping}
          disabled={!lists.some(l => l.selected)}
        >
          <ShoppingCart size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.startButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  listNameSelected: {
    color: '#1E40AF',
  },
  listCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listCountSelected: {
    color: '#3B82F6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  checkboxSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  startButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
