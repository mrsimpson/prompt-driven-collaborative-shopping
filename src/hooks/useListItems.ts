import { useState, useEffect, useCallback } from "react";
import { ServiceFactory } from "@/src/services";
import { ListItem } from "@/src/types/models";
import { DexieListItemRepository } from "@/src/repositories/list-item-repository";

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

      if (result.success) {
        setItems(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch list items"),
      );
      console.error("Error fetching list items:", err);
    } finally {
      setLoading(false);
    }
  }, [listId, shoppingListService]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(
    async (item: Partial<ListItem>) => {
      try {
        setError(null);
        const result = await shoppingListService.addItemToList({
          listId,
          name: item.name || "",
          quantity: item.quantity || 1,
          unit: item.unit || "",
          sortOrder: item.sortOrder,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        setItems((prevItems) => [...prevItems, result.data]);
        return result.data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to add item to list"),
        );
        console.error("Error adding item to list:", err);
        throw err;
      }
    },
    [listId, shoppingListService],
  );

  const updateItem = useCallback(
    async (itemId: string, updates: Partial<ListItem>) => {
      try {
        setError(null);
        const result = await shoppingListService.updateListItem({
          id: itemId,
          listId,
          ...updates,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        setItems((prevItems) =>
          prevItems.map((item) => (item.id === itemId ? result.data : item)),
        );

        return result.data;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update list item"),
        );
        console.error("Error updating list item:", err);
        throw err;
      }
    },
    [listId, shoppingListService],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        setError(null);
        const result = await shoppingListService.removeItemFromList(itemId);

        if (!result.success) {
          throw new Error(result.error);
        }

        setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to remove item from list"),
        );
        console.error("Error removing item from list:", err);
        throw err;
      }
    },
    [shoppingListService],
  );

  const markItemAsPurchased = useCallback(
    async (itemId: string, isPurchased: boolean = true) => {
      try {
        setError(null);
        const item = items.find((i) => i.id === itemId);

        if (!item) {
          throw new Error("Item not found");
        }

        const result = await shoppingListService.updateListItem({
          id: itemId,
          listId,
          isPurchased,
          purchasedAt: isPurchased ? new Date() : undefined,
          // In a real app with authentication, we would include the current user ID
          // purchasedBy: isPurchased ? currentUserId : undefined
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        setItems((prevItems) =>
          prevItems.map((item) => (item.id === itemId ? result.data : item)),
        );

        return result.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to mark item as purchased"),
        );
        console.error("Error marking item as purchased:", err);
        throw err;
      }
    },
    [listId, items, shoppingListService],
  );

  const reorderItems = useCallback(
    async (itemIds: string[]) => {
      try {
        setError(null);
        
        // Update local state immediately for better UX
        const itemsMap = new Map(items.map(item => [item.id, item]));
        const reorderedItems = itemIds
          .map(id => itemsMap.get(id))
          .filter((item): item is ListItem => !!item);
        
        setItems(reorderedItems);
        
        // Call repository to persist the order
        const repository = new DexieListItemRepository();
        await repository.reorderItems(listId, itemIds);
        
        // Refresh items to ensure we have the latest data
        await fetchItems();
        
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to reorder items"),
        );
        console.error("Error reordering items:", err);
        throw err;
      }
    },
    [listId, items, fetchItems],
  );

  return {
    items,
    loading,
    error,
    refreshItems: fetchItems,
    addItem,
    updateItem,
    removeItem,
    markItemAsPurchased,
    reorderItems,
  };
}
