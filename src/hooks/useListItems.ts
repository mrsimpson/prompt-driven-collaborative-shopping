import { useCallback, useEffect, useState } from "react";
import { ListItem } from "../types/models";
import { ServiceFactory } from "../services";
import { safeParseListItem, safeParseListItems } from "../utils/schemas";

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
        // Parse and validate the items
        const validItems = safeParseListItems(result.data);
        setItems(validItems);
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

        // Parse and validate the returned item
        const validItem = safeParseListItem(result.data);
        if (validItem) {
          setItems(prevItems => [...prevItems, validItem]);
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

        // Parse and validate the returned item
        const validItem = safeParseListItem(result.data);
        setItems(prevItems => {
          return prevItems.map(item => {
            if (item.id === itemId && validItem) {
              return validItem;
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

        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
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
        
        // We still need this type assertion for the method call
        const result = await (shoppingListService as any).reorderListItems(
          listId,
          itemIds,
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        // Parse and validate the returned items
        const validItems = safeParseListItems(result.data);
        setItems(validItems);
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

        // Parse and validate the returned item
        const validItem = safeParseListItem(result.data);
        setItems(prevItems => {
          return prevItems.map(item => {
            if (item.id === itemId) {
              if (validItem) {
                return validItem;
              }
              // Apply the purchase status change locally if the server data is invalid
              return { ...item, isPurchased };
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
