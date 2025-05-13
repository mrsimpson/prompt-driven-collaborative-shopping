import { useCallback, useEffect, useState } from "react";
import { ShoppingList } from "../types/models";
import { ServiceFactory } from "../services";
import { safeParseShoppingList, safeParseShoppingLists } from "../utils/schemas";

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const shoppingListService = ServiceFactory.getShoppingListService();

  // Fetch shopping lists
  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user's lists
      // In a real implementation with authentication, we would use the current user's ID
      // For now, we'll use a default user ID that matches what's in the database initialization
      const defaultUserId = "default-user-id";

      const result = await shoppingListService.getUserLists(defaultUserId);

      if (result.success) {
        // Parse and validate the lists
        const validLists = safeParseShoppingLists(result.data);
        setLists(validLists);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch shopping lists"),
      );
      console.error("Error fetching shopping lists:", err);
    } finally {
      setLoading(false);
    }
  }, [shoppingListService]);

  // Load lists on mount
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Create a new shopping list
  const createList = useCallback(
    async (name: string, description: string) => {
      try {
        setError(null);
        const defaultUserId = "default-user-id";

        const result = await shoppingListService.createList(
          { name, description, isShared: false },
          defaultUserId,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        // Parse and validate the returned list
        const validList = safeParseShoppingList(result.data);
        if (validList) {
          setLists(prevLists => [...prevLists, validList]);
        }
        
        return result.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to create shopping list"),
        );
        console.error("Error creating shopping list:", err);
        throw err;
      }
    },
    [shoppingListService],
  );

  // Update a shopping list
  const updateList = useCallback(
    async (listId: string, updates: Partial<ShoppingList>) => {
      try {
        setError(null);
        // Add the default user ID as required by the service
        const defaultUserId = "default-user-id";
        
        const result = await shoppingListService.updateList(
          {
            id: listId,
            ...updates,
          },
          defaultUserId
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        // Parse and validate the returned list
        const validList = safeParseShoppingList(result.data);
        setLists(prevLists => {
          return prevLists.map(list => {
            if (list.id === listId && validList) {
              return validList;
            }
            return list;
          });
        });

        return result.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to update shopping list"),
        );
        console.error("Error updating shopping list:", err);
        throw err;
      }
    },
    [shoppingListService],
  );

  // Delete a shopping list
  const deleteList = useCallback(
    async (listId: string) => {
      try {
        setError(null);
        // Add the default user ID as required by the service
        const defaultUserId = "default-user-id";
        
        const result = await shoppingListService.deleteList(listId, defaultUserId);

        if (!result.success) {
          throw new Error(result.error);
        }

        setLists(prevLists => prevLists.filter(list => list.id !== listId));
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to delete shopping list"),
        );
        console.error("Error deleting shopping list:", err);
        throw err;
      }
    },
    [shoppingListService],
  );

  return {
    lists,
    loading,
    error,
    fetchLists: fetchLists, // Alias for refreshLists
    refreshLists: fetchLists, // Add this for compatibility
    createList,
    updateList,
    deleteList,
  };
}
