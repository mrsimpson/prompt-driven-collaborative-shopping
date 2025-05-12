import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Plus, Check, Trash2, ShoppingBag } from 'lucide-react-native';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';
import { layout, lists, checkboxes, colors, buttons, typography } from '@/src/styles/common';
import { useListItems, useShoppingLists } from '@/src/hooks';

const styles = {
  addItemForm: {
    flexDirection: 'row' as const,
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  itemNameInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
  },
  quantityContainer: {
    flexDirection: 'row' as const,
    width: 100,
    marginRight: 8,
  },
  quantityInput: {
    width: 40,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    textAlign: 'center',
  },
  unitInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 6,
    padding: 12,
    marginLeft: 4,
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
  deleteButton: {
    padding: 8,
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
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
};

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams();
  const listId = Array.isArray(id) ? id[0] : id || '';
  
  const { lists, loading: listsLoading, error: listsError } = useShoppingLists();
  const { 
    items, 
    loading: itemsLoading, 
    error: itemsError,
    addItem,
    updateItem,
    removeItem,
    markItemAsPurchased,
    refreshItems
  } = useListItems(listId);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  // Find the current list from our lists
  const currentList = lists.find(list => list.id === listId);
  
  // Handle loading state
  if (listsLoading || itemsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>Loading list...</Text>
      </View>
    );
  }
  
  // Handle error state
  if (listsError || itemsError || !currentList) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {listsError?.message || itemsError?.message || 'List not found'}
        </Text>
        <TouchableOpacity 
          style={buttons.secondary} 
          onPress={() => router.replace('/lists')}
        >
          <Text style={typography.buttonTextSecondary}>Back to Lists</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    
    try {
      setIsAddingItem(true);
      
      const quantity = parseInt(newItemQuantity, 10) || 1;
      
      await addItem({
        name: newItemName,
        quantity,
        unit: newItemUnit,
        isPurchased: false,
        listId
      });
      
      // Clear the form
      setNewItemName('');
      setNewItemQuantity('1');
      setNewItemUnit('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsAddingItem(false);
    }
  };
  
  const handleToggleItemPurchased = async (itemId: string, currentStatus: boolean) => {
    try {
      await markItemAsPurchased(itemId, !currentStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      Alert.alert('Error', errorMessage);
    }
  };
  
  const handleDeleteItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      Alert.alert('Error', errorMessage);
    }
  };

  const startShoppingWithThisList = () => {
    router.push({
      pathname: '/shopping/session',
      params: { listIds: listId }
    });
  };
  
  return (
    <View style={layout.container}>
      <HeaderWithBack 
        title={currentList.name}
        backTo="/lists"
        backTitle="My Lists"
      />
      
      <View style={styles.addItemForm}>
        <TextInput
          style={styles.itemNameInput}
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Add new item..."
          editable={!isAddingItem}
        />
        <View style={styles.quantityContainer}>
          <TextInput
            style={styles.quantityInput}
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
            editable={!isAddingItem}
          />
          <TextInput
            style={styles.unitInput}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
            placeholder="unit"
            editable={!isAddingItem}
          />
        </View>
        <TouchableOpacity 
          style={[buttons.icon, isAddingItem && buttons.primaryDisabled]}
          onPress={handleAddItem}
          disabled={isAddingItem || !newItemName.trim()}
        >
          {isAddingItem ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Plus size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
      
      {items.length === 0 ? (
        <View style={[layout.centered, { flex: 1 }]}>
          <Text style={typography.body}>This list is empty.</Text>
          <Text style={[typography.bodySmall, { marginTop: 8 }]}>
            Add items using the form above.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[layout.row, lists.item]}>
              <TouchableOpacity 
                style={[
                  checkboxes.base, 
                  item.isPurchased ? checkboxes.checked : {}
                ]}
                onPress={() => handleToggleItemPurchased(item.id, !!item.isPurchased)}
              >
                {item.isPurchased && <Check size={16} color={colors.white} />}
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
                onPress={() => handleDeleteItem(item.id)}
              >
                <Trash2 size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={[lists.content, { paddingBottom: 80 }]} // Extra padding for the footer
          refreshing={itemsLoading}
          onRefresh={refreshItems}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={buttons.primary}
          onPress={startShoppingWithThisList}
        >
          <View style={buttons.iconText}>
            <ShoppingBag size={20} color={colors.white} style={styles.buttonIcon} />
            <Text style={typography.buttonText}>Shop with this list</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
