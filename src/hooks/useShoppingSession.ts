import { useState, useEffect, useCallback } from 'react';
import { ServiceFactory } from '@/src/services';
import { ShoppingSession, ListItem, ShoppingList } from '@/src/types/models';

/**
 * Hook for managing shopping sessions
 * @param sessionId Optional ID of an existing shopping session
 * @returns Object with session data, loading state, error state, and functions to manage the session
 */
export function useShoppingSession(sessionId?: string) {
  const [session, setSession] = useState<ShoppingSession | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(sessionId ? true : false);
  const [error, setError] = useState<Error | null>(null);
  
  const shoppingSessionService = ServiceFactory.getShoppingSessionService();
  
  // Fetch existing session if sessionId is provided
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const sessionData = await shoppingSessionService.getSessionById(sessionId);
      setSession(sessionData);
      
      const sessionLists = await shoppingSessionService.getSessionLists(sessionId);
      setLists(sessionLists);
      
      const sessionItems = await shoppingSessionService.getSessionItems(sessionId);
      setItems(sessionItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch shopping session'));
      console.error('Error fetching shopping session:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, shoppingSessionService]);
  
  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId, fetchSession]);
  
  // Create a new shopping session with selected lists
  const createSession = useCallback(async (listIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const newSession = await shoppingSessionService.createShoppingSession(listIds);
      setSession(newSession);
      
      const sessionLists = await shoppingSessionService.getSessionLists(newSession.id);
      setLists(sessionLists);
      
      const sessionItems = await shoppingSessionService.getSessionItems(newSession.id);
      setItems(sessionItems);
      
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create shopping session'));
      console.error('Error creating shopping session:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [shoppingSessionService]);
  
  // Mark an item as purchased during shopping
  const markItemAsPurchased = useCallback(async (itemId: string, isPurchased: boolean = true) => {
    if (!session) {
      throw new Error('No active shopping session');
    }
    
    try {
      setError(null);
      const updatedItem = await shoppingSessionService.markItemAsPurchased(
        session.id, 
        itemId, 
        isPurchased
      );
      
      setItems(prevItems => 
        prevItems.map(item => item.id === itemId ? updatedItem : item)
      );
      
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark item as purchased'));
      console.error('Error marking item as purchased:', err);
      throw err;
    }
  }, [session, shoppingSessionService]);
  
  // End the shopping session
  const endSession = useCallback(async (createNewListForUnpurchased: boolean = true) => {
    if (!session) {
      throw new Error('No active shopping session');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await shoppingSessionService.endShoppingSession(
        session.id, 
        createNewListForUnpurchased
      );
      
      setSession(null);
      setLists([]);
      setItems([]);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to end shopping session'));
      console.error('Error ending shopping session:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, shoppingSessionService]);
  
  // Get items grouped by their source list (for checkout view)
  const getItemsGroupedByList = useCallback(() => {
    const groupedItems: Record<string, ListItem[]> = {};
    
    items.forEach(item => {
      if (!groupedItems[item.listId]) {
        groupedItems[item.listId] = [];
      }
      groupedItems[item.listId].push(item);
    });
    
    return groupedItems;
  }, [items]);
  
  return {
    session,
    lists,
    items,
    loading,
    error,
    createSession,
    markItemAsPurchased,
    endSession,
    refreshSession: fetchSession,
    getItemsGroupedByList
  };
}
