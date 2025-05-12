import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Plus, Check, Trash2 } from 'lucide-react-native';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';

// Mock data - will be replaced with actual data from Dexie.js
const MOCK_LISTS = {
  '1': {
    id: '1',
    name: 'Grocery List',
    items: [
      { id: '101', name: 'Milk', quantity: 1, unit: 'gallon', isPurchased: false },
      { id: '102', name: 'Eggs', quantity: 12, unit: 'pcs', isPurchased: true },
      { id: '103', name: 'Bread', quantity: 1, unit: 'loaf', isPurchased: false },
      { id: '104', name: 'Apples', quantity: 5, unit: 'pcs', isPurchased: false },
      { id: '105', name: 'Chicken', quantity: 2, unit: 'lbs', isPurchased: false },
    ]
  },
  '2': {
    id: '2',
    name: 'Hardware Store',
    items: [
      { id: '201', name: 'Screws', quantity: 20, unit: 'pcs', isPurchased: false },
      { id: '202', name: 'Paint', quantity: 1, unit: 'gallon', isPurchased: false },
      { id: '203', name: 'Sandpaper', quantity: 5, unit: 'sheets', isPurchased: false },
    ]
  },
  '3': {
    id: '3',
    name: 'Birthday Party',
    items: [
      { id: '301', name: 'Balloons', quantity: 20, unit: 'pcs', isPurchased: false },
      { id: '302', name: 'Cake', quantity: 1, unit: '', isPurchased: false },
      { id: '303', name: 'Candles', quantity: 12, unit: 'pcs', isPurchased: false },
      { id: '304', name: 'Party hats', quantity: 10, unit: 'pcs', isPurchased: false },
      { id: '305', name: 'Napkins', quantity: 50, unit: 'pcs', isPurchased: false },
      { id: '306', name: 'Plates', quantity: 20, unit: 'pcs', isPurchased: false },
      { id: '307', name: 'Cups', quantity: 20, unit: 'pcs', isPurchased: false },
      { id: '308', name: 'Juice', quantity: 2, unit: 'gallons', isPurchased: false },
    ]
  }
};

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id;
  
  // In a real implementation, we would fetch this from Dexie.js
  const list = MOCK_LISTS[listId as keyof typeof MOCK_LISTS];
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  
  if (!list) {
    return (
      <View style={styles.container}>
        <Text>List not found</Text>
      </View>
    );
  }
  
  // These functions would interact with our service layer in a real implementation
  const toggleItemPurchased = (itemId: string) => {
    // This would update the item in Dexie.js
    console.log(`Toggle item ${itemId} purchased status`);
  };
  
  const addNewItem = () => {
    if (!newItemName.trim()) return;
    
    // This would add a new item to the list in Dexie.js
    console.log(`Add new item: ${newItemName}, ${newItemQuantity} ${newItemUnit}`);
    
    // Clear the form
    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemUnit('');
  };
  
  const deleteItem = (itemId: string) => {
    // This would delete the item from Dexie.js
    console.log(`Delete item ${itemId}`);
  };
  
  return (
    <View style={styles.container}>
      <HeaderWithBack 
        title={list.name}
        backTo="/lists"
        backTitle="My Lists"
      />
      
      <View style={styles.addItemForm}>
        <TextInput
          style={styles.itemNameInput}
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Add new item..."
        />
        <View style={styles.quantityContainer}>
          <TextInput
            style={styles.quantityInput}
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.unitInput}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
            placeholder="unit"
          />
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addNewItem}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <TouchableOpacity 
              style={[
                styles.checkbox, 
                item.isPurchased && styles.checkboxChecked
              ]}
              onPress={() => toggleItemPurchased(item.id)}
            >
              {item.isPurchased && <Check size={16} color="#FFFFFF" />}
            </TouchableOpacity>
            
            <View style={styles.itemDetails}>
              <Text style={[
                styles.itemName,
                item.isPurchased && styles.itemPurchased
              ]}>
                {item.name}
              </Text>
              <Text style={styles.itemQuantity}>
                {item.quantity} {item.unit}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteItem(item.id)}
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
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
  addItemForm: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemNameInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    width: 100,
    marginRight: 8,
  },
  quantityInput: {
    width: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 12,
    textAlign: 'center',
  },
  unitInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    padding: 12,
    marginLeft: 4,
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  itemPurchased: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
