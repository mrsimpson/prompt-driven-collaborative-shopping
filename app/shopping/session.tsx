import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Check, ShoppingBag } from 'lucide-react-native';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';

// Mock data - will be replaced with actual data from our shopping session
const MOCK_ITEMS = [
  { id: '101', name: 'Milk', quantity: 1, unit: 'gallon', isPurchased: false, sourceList: 'Grocery List' },
  { id: '102', name: 'Eggs', quantity: 12, unit: 'pcs', isPurchased: false, sourceList: 'Grocery List' },
  { id: '103', name: 'Bread', quantity: 1, unit: 'loaf', isPurchased: false, sourceList: 'Grocery List' },
  { id: '201', name: 'Screws', quantity: 20, unit: 'pcs', isPurchased: false, sourceList: 'Hardware Store' },
  { id: '202', name: 'Paint', quantity: 1, unit: 'gallon', isPurchased: false, sourceList: 'Hardware Store' },
  { id: '301', name: 'Balloons', quantity: 20, unit: 'pcs', isPurchased: false, sourceList: 'Birthday Party' },
  { id: '302', name: 'Cake', quantity: 1, unit: '', isPurchased: false, sourceList: 'Birthday Party' },
];

export default function ShoppingSessionScreen() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  
  const toggleItemPurchased = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
    ));
  };
  
  const goToCheckout = () => {
    if (!items.some(item => item.isPurchased)) {
      Alert.alert('No Items Purchased', 'You need to purchase at least one item to proceed to checkout.');
      return;
    }
    setIsCheckoutMode(true);
  };
  
  const endShopping = () => {
    // In a real implementation, this would end the shopping session
    // and update the lists in our database
    Alert.alert(
      'End Shopping Session',
      'Are you sure you want to end this shopping session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: () => {
            console.log('Ending shopping session');
            router.replace('/');
          }
        }
      ]
    );
  };
  
  // Group items by source list for checkout mode
  const groupedItems = items.reduce((groups, item) => {
    if (!groups[item.sourceList]) {
      groups[item.sourceList] = [];
    }
    if (item.isPurchased) {
      groups[item.sourceList].push(item);
    }
    return groups;
  }, {} as Record<string, typeof items>);
  
  const sourceListNames = Object.keys(groupedItems);
  
  if (isCheckoutMode) {
    return (
      <View style={styles.container}>
        <HeaderWithBack 
          title="Checkout"
          onBack={() => setIsCheckoutMode(false)}
          backTitle="Shopping"
        />
        
        <FlatList
          data={sourceListNames}
          keyExtractor={(item) => item}
          renderItem={({ item: listName }) => (
            <View style={styles.listSection}>
              <Text style={styles.listTitle}>{listName}</Text>
              {groupedItems[listName].map(item => (
                <View key={item.id} style={styles.checkoutItem}>
                  <Text style={styles.checkoutItemName}>{item.name}</Text>
                  <Text style={styles.checkoutItemQuantity}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
        
        <TouchableOpacity 
          style={styles.endButton}
          onPress={endShopping}
        >
          <Text style={styles.endButtonText}>End Shopping Session</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <HeaderWithBack 
        title="Shopping"
        backTo="/shopping"
        backTitle="Select Lists"
      />
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.itemRow,
              item.isPurchased && styles.itemRowPurchased
            ]}
            onPress={() => toggleItemPurchased(item.id)}
          >
            <View style={[
              styles.checkbox,
              item.isPurchased && styles.checkboxChecked
            ]}>
              {item.isPurchased && <Check size={16} color="#FFFFFF" />}
            </View>
            
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
              <Text style={styles.itemSource}>
                From: {item.sourceList}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={goToCheckout}
        >
          <ShoppingBag size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
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
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for the footer
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
  itemRowPurchased: {
    backgroundColor: '#F3F4F6',
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
  itemSource: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  checkoutButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    backgroundColor: '#E5E7EB',
    padding: 8,
    borderRadius: 4,
  },
  checkoutItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkoutItemName: {
    fontSize: 16,
    color: '#111827',
  },
  checkoutItemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  endButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
