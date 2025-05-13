import { useState, useEffect, useCallback } from "react";
import { ServiceFactory } from "@/src/services";
import {
  ShoppingSession,
  ListItem,
  ShoppingList,
  ShoppingSessionStatus,
} from "@/src/types/models";
import { EndShoppingSessionParams } from "../types/operations";

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
  const shoppingListService = ServiceFactory.getShoppingListService();

  // Fetch existing session if sessionId is provided
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Get session data
      const sessionResult =
        await shoppingSessionService.getActiveSession("default-user-id");

      if (!sessionResult.success || !sessionResult.data) {
        throw new Error(sessionResult.error || "Session not found");
      }

      setSession(sessionResult.data);

      // Get session with lists
      const sessionWithListsResult =
        await shoppingSessionService.getSessionWithLists(sessionId);

      if (!sessionWithListsResult.success) {
        throw new Error(sessionWithListsResult.error);
      }

      setLists(sessionWithListsResult.lists);

      // Get consolidated items
      const itemsResult =
        await shoppingSessionService.getConsolidatedItems(sessionId);

      if (!itemsResult.success) {
        throw new Error(itemsResult.error);
      }

      setItems(itemsResult.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch shopping session"),
      );
      console.error("Error fetching shopping session:", err);
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
  const createSession = useCallback(
    async (listIds: string[]) => {
      try {
        setLoading(true);
        setError(null);

        // Default user ID for local mode
        const defaultUserId = "default-user-id";

        // Check for existing active sessions and end them first
        const activeSessionResult =
          await shoppingSessionService.getActiveSession(defaultUserId);

        if (activeSessionResult.success && activeSessionResult.data) {
          console.log("Found existing active session, ending it first...");
          await shoppingSessionService.endSession({
            sessionId: activeSessionResult.data.id,
            createNewListForUnpurchased: false,
            status: ShoppingSessionStatus.CANCELLED,
          });
        }

        // Create a new shopping session
        const sessionResult = await shoppingSessionService.createSession({
          userId: defaultUserId,
          listIds: listIds,
        });

        if (!sessionResult.success) {
          throw new Error(sessionResult.error);
        }

        const newSession = sessionResult.data;
        setSession(newSession);

        // Get the lists for this session
        const listsPromises = listIds.map((id) =>
          shoppingListService.getList(id),
        );
        const listsResults = await Promise.all(listsPromises);

        const validLists = listsResults
          .filter((result) => result.success)
          .map((result) => result.data);

        setLists(validLists);

        // Get consolidated items
        const itemsResult = await shoppingSessionService.getConsolidatedItems(
          newSession.id,
        );

        if (!itemsResult.success) {
          throw new Error(itemsResult.error);
        }

        setItems(itemsResult.data);

        return newSession;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to create shopping session"),
        );
        console.error("Error creating shopping session:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [shoppingSessionService, shoppingListService],
  );

  // Mark an item as purchased during shopping
  const markItemAsPurchased = useCallback(
    async (itemId: string, isPurchased: boolean = true) => {
      if (!session) {
        throw new Error("No active shopping session");
      }

      try {
        setError(null);

        // Find the item to update
        const item = items.find((i) => i.id === itemId);

        if (!item) {
          throw new Error("Item not found");
        }

        // Update the item
        const result = await shoppingListService.updateListItem({
          id: itemId,
          listId: item.listId,
          isPurchased,
          purchasedAt: isPurchased ? new Date() : undefined,
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        // Update local state
        setItems((prevItems) =>
          prevItems.map((i) => (i.id === itemId ? result.data : i)),
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
    [session, items, shoppingListService],
  );

  // End the shopping session
  const endSession = useCallback(
    async (params: EndShoppingSessionParams) => {
      if (!session) {
        throw new Error("No active shopping session");
      }

      try {
        setLoading(true);
        setError(null);

        const result = await shoppingSessionService.endSession(params);

        if (!result.success) {
          throw new Error(result.error);
        }

        setSession(null);
        setLists([]);
        setItems([]);

        return result.data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to end shopping session"),
        );
        console.error("Error ending shopping session:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [session, shoppingSessionService],
  );

  // Cancel the shopping session (when navigating away)
  const cancelSession = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      console.log("Canceling shopping session...");

      // End the session without creating a new list for unpurchased items
      const result = await shoppingSessionService.endSession({
        sessionId: session.id,
        status: "cancelled",
        createNewListForUnpurchased: false,
      });

      if (!result.success) {
        console.error("Failed to cancel session:", result.error);
      }

      setSession(null);
      setLists([]);
      setItems([]);
    } catch (err) {
      console.error("Error canceling shopping session:", err);
    }
  }, [session, shoppingSessionService]);

  // We're not using this function anymore, but keeping it for future reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getItemsGroupedByList = useCallback(() => {
    const groupedItems: Record<string, ListItem[]> = {};

    items.forEach((item) => {
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
    cancelSession,
    refreshSession: fetchSession,
  };
}
