import { useState, useEffect, useCallback } from "react";
import { ServiceFactory } from "@/src/services";
import { ShoppingList } from "@/src/types/models";

/**
 * Hook for managing shopping lists
 * @returns Object with lists, loading state, error state, and functions to manage lists
 */
export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const shoppingListService = ServiceFactory.getShoppingListService();

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
        setLists(result.data);
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

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (name: string, description: string) => {
      try {
        setError(null);
        const defaultUserId = "default-user-id";

        const result = await shoppingListService.createList(
          { name, description },
          defaultUserId,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        setLists((prevLists) => [...prevLists, result.data]);
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

  const updateList = useCallback(
    async (listId: string, updates: Partial<ShoppingList>) => {
      try {
        setError(null);
        const defaultUserId = "default-user-id";

        const result = await shoppingListService.updateList(
          { id: listId, ...updates },
          defaultUserId,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        setLists((prevLists) =>
          prevLists.map((list) => (list.id === listId ? result.data : list)),
        );

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

  const deleteList = useCallback(
    async (listId: string) => {
      try {
        setError(null);
        const defaultUserId = "default-user-id";

        const result = await shoppingListService.deleteList(
          listId,
          defaultUserId,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
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
    refreshLists: fetchLists,
    createList,
    updateList,
    deleteList,
  };
}
