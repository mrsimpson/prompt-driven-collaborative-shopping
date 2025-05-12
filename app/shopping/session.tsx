import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, ShoppingBag } from 'lucide-react-native';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';
import { layout, colors, typography, buttons } from '@/src/styles/common';

// Mock data - will be replaced with actual data from our shopping session
const ALL_MOCK_ITEMS = [
  { id: '101', name: 'Milk', quantity: 1, unit: 'gallon', isPurchased: false, sourceList: 'Grocery List', listId: '1' },
  { id: '102', name: 'Eggs', quantity: 12, unit: 'pcs', isPurchased: false, sourceList: 'Grocery List', listId: '1' },
  { id: '103', name: 'Bread', quantity: 1, unit: 'loaf', isPurchased: false, sourceList: 'Grocery List', listId: '1' },
  { id: '201', name: 'Screws', quantity: 20, unit: 'pcs', isPurchased: false, sourceList: 'Hardware Store', listId: '2' },
  { id: '202', name: 'Paint', quantity: 1, unit: 'gallon', isPurchased: false, sourceList: 'Hardware Store', listId: '2' },
  { id: '301', name: 'Balloons', quantity: 20, unit: 'pcs', isPurchased: false, sourceList: 'Birthday Party', listId: '3' },
  { id: '302', name: 'Cake', quantity: 1, unit: '', isPurchased: false, sourceList: 'Birthday Party', listId: '3' },
];

export default function ShoppingSessionScreen() {
  const params = useLocalSearchParams();
  const listIds = params.listIds ? String(params.listIds).split(',') : [];
  
  const [items, setItems] = useState(ALL_MOCK_ITEMS);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  
  // Filter items based on listIds if provided
  useEffect(() => {
    if (listIds.length > 0) {
      setItems(ALL_MOCK_ITEMS.filter(item => listIds.includes(item.listId)));
    }
  }, [listIds]);
  
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
        backTo={listIds.length > 0 ? `/lists/${listIds[0]}` : "/shopping"}
        backTitle={listIds.length > 0 ? "Back to List" : "Select Lists"}
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
          <View style={styles.buttonContainer}>
            <ShoppingBag size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for the footer
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  itemRowPurchased: {
    backgroundColor: colors.gray100,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  itemPurchased: {
    textDecorationLine: 'line-through',
    color: colors.gray400,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },
  itemSource: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 16,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    marginBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
    backgroundColor: colors.gray200,
    padding: 8,
    borderRadius: 4,
  },
  checkoutItem: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkoutItemName: {
    fontSize: 16,
    color: colors.black,
  },
  checkoutItemQuantity: {
    fontSize: 14,
    color: colors.gray500,
  },
  endButton: {
    backgroundColor: colors.danger,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  endButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
