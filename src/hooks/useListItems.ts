import { useCallback, useEffect, useState } from "react";
import { ListItem } from "../types/models";
import { ServiceFactory } from "../services";

export function useListItems(listId: string) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const shoppingListService = ServiceFactory.getShoppingListService();

  // Fetch list items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await shoppingListService.getListItems(listId);

      if (result.success) {
        setItems(result.data || []);
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

  // Load items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Add a new item to the list
  const addItem = useCallback(
    async (item: Omit<ListItem, "id" | "listId" | "createdAt" | "updatedAt" | "lastModifiedAt" | "sortOrder">) => {
      try {
        setError(null);
        const result = await shoppingListService.addItemToList({
          listId,
          ...item,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Ensure we're adding a valid item
        if (result.data) {
          // Use a non-arrow function to ensure proper typing
          setItems(function(prevItems: ListItem[]): ListItem[] {
            // Type assertion to ensure result.data is treated as ListItem
            return [...prevItems, result.data as ListItem];
          });
        }
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

        // Safely update items, ensuring no undefined values
        setItems(function(prevItems: ListItem[]): ListItem[] {
          return prevItems.map((item) => {
            if (item.id === itemId && result.data) {
              return result.data as ListItem;
            }
            return item;
          });
        });

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

  const reorderItems = useCallback(
    async (itemIds: string[]) => {
      try {
        setError(null);
        // Check if the service has the reorderListItems method
        if (typeof (shoppingListService as any).reorderListItems !== 'function') {
          throw new Error("reorderListItems method not available");
        }
        
        // Use type assertion to call the method
        const result = await (shoppingListService as any).reorderListItems(
          listId,
          itemIds,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        // Update the local items with the new order
        if (Array.isArray(result.data)) {
          setItems(result.data as ListItem[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to reorder items"),
        );
        console.error("Error reordering items:", err);
        throw err;
      }
    },
    [listId, shoppingListService],
  );

  const markItemAsPurchased = useCallback(
    async (itemId: string, isPurchased: boolean) => {
      try {
        setError(null);
        const result = await shoppingListService.updateListItem({
          id: itemId,
          listId,
          isPurchased,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Safely update items, ensuring no undefined values
        setItems(function(prevItems: ListItem[]): ListItem[] {
          return prevItems.map((item) => {
            if (item.id === itemId && result.data) {
              return result.data as ListItem;
            }
            return item;
          });
        });

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
    [listId, shoppingListService],
  );

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    markItemAsPurchased,
  };
}
