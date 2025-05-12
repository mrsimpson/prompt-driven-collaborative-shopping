import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Check, ShoppingBag } from 'lucide-react-native';
import { HeaderWithBack } from '@/src/components/HeaderWithBack';
import { colors, layout, typography, buttons } from '@/src/styles/common';
import { useShoppingSession } from '@/src/hooks';

export default function ShoppingSessionScreen() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  
  // Use useMemo to prevent the listIds array from being recreated on every render
  const listIds = useMemo(() => {
    return params.listIds ? String(params.listIds).split(',') : [];
  }, [params.listIds]);
  
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  
  const { 
    session,
    lists,
    items,
    loading,
    error,
    createSession,
    markItemAsPurchased,
    endSession,
    getItemsGroupedByList
  } = useShoppingSession();
  
  // Create a new shopping session when the component mounts
  useEffect(() => {
    if (listIds.length > 0 && !session) {
      createSession(listIds).catch(err => {
        console.error('Failed to create shopping session:', err);
        Alert.alert(
          'Error',
          'Failed to create shopping session. Please try again.',
          [
            { 
              text: 'Go Back', 
              onPress: () => router.back() 
            }
          ]
        );
      });
    }
  }, [listIds, createSession, session]);

  // Add a listener to end the session when navigating away
  useEffect(() => {
    // This function will be called when the screen is about to be unfocused/navigated away from
    const endSessionOnLeave = () => {
      if (session) {
        console.log('Ending shopping session due to navigation away');
        endSession(true).catch(error => {
          console.error('Failed to end shopping session on navigation:', error);
        });
      }
    };

    // Add the listener for navigation events
    const unsubscribe = navigation.addListener('beforeRemove', endSessionOnLeave);

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [session, endSession, navigation]);
  
  // Handle loading state
  if (loading) {
    return (
      <View style={[layout.container, layout.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { marginTop: 16 }]}>
          {session ? 'Loading shopping items...' : 'Creating shopping session...'}
        </Text>
      </View>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <View style={[layout.container, layout.centered]}>
        <Text style={[typography.body, { color: colors.danger, marginBottom: 16 }]}>
          {error.message || 'An error occurred during shopping'}
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
  
  // Handle case where no lists were selected
  if (listIds.length === 0) {
    return (
      <View style={[layout.container, layout.centered]}>
        <Text style={typography.body}>No shopping lists selected</Text>
        <TouchableOpacity 
          style={[buttons.primary, { marginTop: 16 }]}
          onPress={() => router.replace('/shopping')}
        >
          <Text style={typography.buttonText}>Select Lists</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const handleToggleItemPurchased = async (itemId: string, currentStatus: boolean) => {
    try {
      await markItemAsPurchased(itemId, !currentStatus);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      Alert.alert('Error', errorMessage);
    }
  };
  
  const handleGoToCheckout = () => {
    if (!items.some(item => item.isPurchased)) {
      Alert.alert('No Items Purchased', 'You need to purchase at least one item to proceed to checkout.');
      return;
    }
    setIsCheckoutMode(true);
  };
  
  const handleEndShopping = () => {
    Alert.alert(
      'End Shopping Session',
      'Are you sure you want to end this shopping session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession(true);
              router.replace('/');
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to end shopping session';
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };
  
  // Group items by source list for checkout mode
  const groupedItems = isCheckoutMode ? getItemsGroupedByList() : {};
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
          data={lists}
          keyExtractor={(list) => list.id}
          renderItem={({ item: list }) => {
            const listItems = items.filter(
              item => item.listId === list.id && item.isPurchased
            );
            
            if (listItems.length === 0) return null;
            
            return (
              <View style={styles.listSection}>
                <Text style={styles.listTitle}>{list.name}</Text>
                {listItems.map(item => (
                  <View key={item.id} style={styles.checkoutItem}>
                    <Text style={styles.checkoutItemName}>{item.name}</Text>
                    <Text style={styles.checkoutItemQuantity}>
                      {item.quantity} {item.unit}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
        
        <TouchableOpacity 
          style={styles.endButton}
          onPress={handleEndShopping}
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
        keyExtractor={(item) => {
          // Generate a stable ID for each item
          if (!item.id) {
            // If the item doesn't have an ID, create one from its properties
            return `${item.listId}-${item.name}-${item.quantity}-${item.unit}`;
          }
          return item.id;
        }}
        renderItem={({ item }) => {
          // Find the source list for this item
          const sourceList = lists.find(list => list.id === item.listId);
          
          return (
            <TouchableOpacity 
              style={[
                styles.itemRow,
                item.isPurchased && styles.itemRowPurchased
              ]}
              onPress={() => {
                // Make sure the item has an ID before trying to toggle its status
                if (!item.id) {
                  Alert.alert('Error', 'Cannot update this item because it has no ID');
                  return;
                }
                handleToggleItemPurchased(item.id, !!item.isPurchased);
              }}
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
                  From: {sourceList?.name || 'Unknown List'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handleGoToCheckout}
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
