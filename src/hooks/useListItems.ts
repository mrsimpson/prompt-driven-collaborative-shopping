import { useState, useEffect, useCallback } from 'react';
import { ServiceFactory } from '@/src/services';
import { ListItem } from '@/src/types/models';

/**
 * Hook for managing list items for a specific shopping list
 * @param listId The ID of the shopping list
 * @returns Object with items, loading state, error state, and functions to manage items
 */
export function useListItems(listId: string) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const shoppingListService = ServiceFactory.getShoppingListService();
  
  const fetchItems = useCallback(async () => {
    if (!listId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await shoppingListService.getListItems(listId);
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch list items'));
      console.error('Error fetching list items:', err);
    } finally {
      setLoading(false);
    }
  }, [listId, shoppingListService]);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  const addItem = useCallback(async (item: Partial<ListItem>) => {
    try {
      setError(null);
      const newItem = await shoppingListService.addItemToList(listId, item);
      setItems(prevItems => [...prevItems, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add item to list'));
      console.error('Error adding item to list:', err);
      throw err;
    }
  }, [listId, shoppingListService]);
  
  const updateItem = useCallback(async (itemId: string, updates: Partial<ListItem>) => {
    try {
      setError(null);
      const updatedItem = await shoppingListService.updateListItem(listId, itemId, updates);
      setItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update list item'));
      console.error('Error updating list item:', err);
      throw err;
    }
  }, [listId, shoppingListService]);
  
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      await shoppingListService.removeItemFromList(listId, itemId);
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove item from list'));
      console.error('Error removing item from list:', err);
      throw err;
    }
  }, [listId, shoppingListService]);
  
  const markItemAsPurchased = useCallback(async (itemId: string, isPurchased: boolean = true) => {
    try {
      setError(null);
      const updatedItem = await shoppingListService.updateListItem(listId, itemId, { 
        isPurchased,
        purchasedAt: isPurchased ? new Date() : undefined,
        // In a real app with authentication, we would include the current user ID
        // purchasedBy: isPurchased ? currentUserId : undefined
      });
      
      setItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark item as purchased'));
      console.error('Error marking item as purchased:', err);
      throw err;
    }
  }, [listId, shoppingListService]);
  
  return { 
    items, 
    loading, 
    error, 
    refreshItems: fetchItems,
    addItem,
    updateItem,
    removeItem,
    markItemAsPurchased
  };
}
