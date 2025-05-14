import {
  ShoppingSession,
  ShoppingSessionStatus,
  ShoppingList,
} from "../types/models";
import {
  CreateShoppingSessionParams,
  EndShoppingSessionParams,
  Result,
} from "../types/operations";
import {
  ShoppingSessionRepository,
  DexieShoppingSessionRepository,
} from "../repositories/shopping-session-repository";
import {
  ShoppingListRepository,
  DexieShoppingListRepository,
} from "../repositories/shopping-list-repository";
import {
  ListItemRepository,
  DexieListItemRepository,
} from "../repositories/list-item-repository";
import { generateUUID } from "../utils/uuid";
import { db } from "../stores/database";

/**
 * Service interface for shopping session operations
 */
export interface ShoppingSessionService {
  createSession(
    params: CreateShoppingSessionParams,
  ): Promise<Result<ShoppingSession>>;
  getActiveSession(userId: string): Promise<Result<ShoppingSession | null>>;
  getSessionWithLists(
    sessionId: string,
  ): Promise<Result<{ session: ShoppingSession; lists: ShoppingList[] }>>;
  addListToSession(sessionId: string, listId: string): Promise<Result<void>>;
  removeListFromSession(
    sessionId: string,
    listId: string,
  ): Promise<Result<void>>;
  endSession(
    params: EndShoppingSessionParams,
  ): Promise<Result<ShoppingSession>>;
  getConsolidatedItems(sessionId: string): Promise<Result<any[]>>;
  getItemsBySourceList(sessionId: string): Promise<Result<any>>;
}

/**
 * Local implementation of the shopping session service
 */
export class LocalShoppingSessionService implements ShoppingSessionService {
  private sessionRepository: ShoppingSessionRepository;
  private listRepository: ShoppingListRepository;
  private itemRepository: ListItemRepository;

  constructor() {
    this.sessionRepository = new DexieShoppingSessionRepository();
    this.listRepository = new DexieShoppingListRepository();
    this.itemRepository = new DexieListItemRepository();
  }

  /**
   * Create a new shopping session
   * @param params Session creation parameters
   * @returns Result with the created session
   */
  async createSession(
    params: CreateShoppingSessionParams,
  ): Promise<Result<ShoppingSession>> {
    try {
      // Check if the user already has an active session
      const existingSession = await this.sessionRepository.findActiveByUser(
        params.userId,
      );

      // If there's an existing session, end it first
      if (existingSession) {
        console.log(
          `Ending existing session ${existingSession.id} before creating a new one`,
        );

        // End the existing session
        await this.endSession({
          sessionId: existingSession.id,
          status: ShoppingSessionStatus.CANCELLED,
          createNewListForUnpurchased: false,
        });
      }

      // Check if all lists exist and are not locked
      for (const listId of params.listIds) {
        const list = await this.listRepository.findById(listId);
        if (!list) {
          return { success: false, error: `List with ID ${listId} not found` };
        }
        if (list.isLocked) {
          return {
            success: false,
            error: `List with ID ${listId} is already locked`,
          };
        }
      }

      // Create the session
      const now = new Date();
      const session: Partial<ShoppingSession> = {
        userId: params.userId,
        startedAt: now,
        status: ShoppingSessionStatus.ACTIVE,
      };

      const savedSession = await this.sessionRepository.save(session);

      // Add lists to the session and lock them
      for (const listId of params.listIds) {
        await this.sessionRepository.addListToSession(savedSession.id, listId);
        await this.listRepository.lockList(listId);
      }

      return { success: true, data: savedSession };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create shopping session",
      };
    }
  }

  /**
   * Get the active shopping session for a user
   * @param userId User ID
   * @returns Result with the active session or null
   */
  async getActiveSession(
    userId: string,
  ): Promise<Result<ShoppingSession | null>> {
    try {
      const session = await this.sessionRepository.findActiveByUser(userId);
      return { success: true, data: session };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get active session",
      };
    }
  }

  /**
   * Get a shopping session with its associated lists
   * @param sessionId Session ID
   * @returns Result with the session and its lists
   */
  async getSessionWithLists(
    sessionId: string,
  ): Promise<Result<{ session: ShoppingSession; lists: ShoppingList[] }>> {
    try {
      const { session, lists: listIds } =
        await this.sessionRepository.findWithLists(sessionId);

      const lists: ShoppingList[] = [];
      for (const listId of listIds) {
        const list = await this.listRepository.findById(listId);
        if (list) {
          lists.push(list);
        }
      }

      return { success: true, data: { session, lists } };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get session with lists",
      };
    }
  }

  /**
   * Add a list to an active shopping session
   * @param sessionId Session ID
   * @param listId List ID
   * @returns Result indicating success or failure
   */
  async addListToSession(
    sessionId: string,
    listId: string,
  ): Promise<Result<void>> {
    try {
      // Check if the session exists and is active
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        return { success: false, error: "Session not found" };
      }
      if (session.status !== ShoppingSessionStatus.ACTIVE) {
        return {
          success: false,
          error: "Cannot add lists to a non-active session",
        };
      }

      // Check if the list exists and is not locked
      const list = await this.listRepository.findById(listId);
      if (!list) {
        return { success: false, error: "List not found" };
      }
      if (list.isLocked) {
        return { success: false, error: "List is already locked" };
      }

      // Add the list to the session and lock it
      await this.sessionRepository.addListToSession(sessionId, listId);
      await this.listRepository.lockList(listId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add list to session",
      };
    }
  }

  /**
   * Remove a list from an active shopping session
   * @param sessionId Session ID
   * @param listId List ID
   * @returns Result indicating success or failure
   */
  async removeListFromSession(
    sessionId: string,
    listId: string,
  ): Promise<Result<void>> {
    try {
      // Check if the session exists and is active
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        return { success: false, error: "Session not found" };
      }
      if (session.status !== ShoppingSessionStatus.ACTIVE) {
        return {
          success: false,
          error: "Cannot remove lists from a non-active session",
        };
      }

      // Remove the list from the session and unlock it
      await this.sessionRepository.removeListFromSession(sessionId, listId);
      await this.listRepository.unlockList(listId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove list from session",
      };
    }
  }

  /**
   * End a shopping session
   * @pa-ram params Session ending parameters
   * @returns Result with the updated session
   */
  async endSession(
    params: EndShoppingSessionParams,
  ): Promise<Result<ShoppingSession>> {
    try {
      // Check if the session exists and is active
      const session = await this.sessionRepository.findById(params.sessionId);
      if (!session) {
        return { success: false, error: "Session not found" };
      }
      if (session.status !== ShoppingSessionStatus.ACTIVE) {
        return { success: false, error: "Session is not active" };
      }

      // Get all lists in the session
      const listIds = await this.sessionRepository.getSessionLists(
        params.sessionId,
      );

      // Create a new list for unpurchased items if requested
      let newListId: string | undefined;
      if (params.createNewListForUnpurchased) {
        // Create a new list
        const now = new Date();
        const newList: Partial<ShoppingList> = {
          name: params.newListName || "Unpurchased Items",
          description: params.newListDescription,
          createdBy: session.userId,
          isShared: false,
          isLocked: false,
        };

        const savedList = await this.listRepository.save(newList);
        newListId = savedList.id;

        // Make the user an owner of the new list
        await this.addListOwner(newListId, session.userId);

        // Move unpurchased items to the new list and soft delete the original lists
        for (const listId of listIds) {
          const items = await this.itemRepository.findByList(listId);
          let hasUnpurchasedItems = false;

          // First pass: check if there are any unpurchased items
          for (const item of items) {
            if (!item.isPurchased) {
              hasUnpurchasedItems = true;
              break;
            }
          }

          // Second pass: move unpurchased items
          for (const item of items) {
            if (!item.isPurchased) {
              // Create a copy of the item in the new list
              const newItem = { ...item };
              delete (newItem as any).id;
              newItem.listId = newListId;
              newItem.createdAt = now;
              newItem.updatedAt = now;
              newItem.lastModifiedAt = now;

              await this.itemRepository.save(newItem);

              // Soft delete the original item
              await this.itemRepository.softDelete(item.id);
            }
          }

          // If this list had unpurchased items, soft delete it
          if (hasUnpurchasedItems) {
            console.log(
              `Soft deleting list ${listId} because it had unpurchased items`,
            );
            await this.listRepository.softDelete(listId);
          }
        }
      }

      // Unlock all lists
      for (const listId of listIds) {
        await this.listRepository.unlockList(listId);
      }

      // End the session
      const updatedSession = await this.sessionRepository.endSession(
        params.sessionId,
        params.status,
      );

      return { success: true, data: updatedSession };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to end shopping session",
      };
    }
  }

  /**
   * Get consolidated items from all lists in a session, grouping identical items
   * while maintaining a logical order based on the first occurrence of each item.
   * @param sessionId Session ID
   * @returns Result with consolidated items
   */
  async getConsolidatedItems(sessionId: string): Promise<Result<any[]>> {
    try {
      // Get all lists in the session
      const listIds = await this.sessionRepository.getSessionLists(sessionId);

      // Get the user's ID from the session
      const session = await this.sessionRepository.findById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // Reorder listIds to prioritize user's own lists first
      const lists = await Promise.all(
        listIds.map((id) => this.listRepository.findById(id)),
      );
      const orderedListIds = [...listIds].sort((a, b) => {
        const listA = lists.find((l) => l?.id === a);
        const listB = lists.find((l) => l?.id === b);
        // User's own lists come first
        if (
          listA?.createdBy === session.userId &&
          listB?.createdBy !== session.userId
        )
          return -1;
        if (
          listA?.createdBy !== session.userId &&
          listB?.createdBy === session.userId
        )
          return 1;
        return 0;
      });

      // Get all items from these lists
      const allItems = await this.itemRepository.findByLists(orderedListIds);

      // Create a map to track processed items by their normalized name
      const processedItems = new Map<string, Set<string>>();

      // Create a map to store the order of first appearance for each unique item
      const itemOrders = new Map<string, number>();

      // Final array of consolidated items
      const consolidatedItems: any[] = [];

      // Counter for assigning order to unique items
      let orderCounter = 0;

      // Process lists in order
      for (const listId of orderedListIds) {
        // Get items for this list, sorted by their original order
        const listItems = allItems
          .filter((item) => item.listId === listId)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        for (const item of listItems) {
          // Normalize item name for comparison
          const normalizedName = `${item.name.toLowerCase()}_${item.unit.toLowerCase()}`;

          // Skip if we've already processed this item from this list
          if (processedItems.get(normalizedName)?.has(listId)) {
            continue;
          }

          // Initialize set of processed list IDs for this item if needed
          if (!processedItems.has(normalizedName)) {
            processedItems.set(normalizedName, new Set<string>());
            // Assign order number to new unique items
            itemOrders.set(normalizedName, orderCounter++);
          }

          // Mark this item as processed for this list
          processedItems.get(normalizedName)!.add(listId);

          // Find all instances of this item across all lists
          const sameItems = allItems.filter(
            (otherItem) =>
              `${otherItem.name.toLowerCase()}_${otherItem.unit.toLowerCase()}` ===
              normalizedName,
          );

          // Calculate total quantity and check if any instance is purchased
          const totalQuantity = sameItems.reduce(
            (sum, i) => sum + i.quantity,
            0,
          );
          const anyPurchased = sameItems.some((i) => i.isPurchased);

          // Create or update consolidated item
          const existingItemIndex = consolidatedItems.findIndex(
            (ci) =>
              `${ci.name.toLowerCase()}_${ci.unit.toLowerCase()}` ===
              normalizedName,
          );

          if (existingItemIndex === -1) {
            // Create new consolidated item
            consolidatedItems.push({
              id: item.id,
              name: item.name,
              quantity: totalQuantity,
              unit: item.unit,
              isPurchased: anyPurchased,
              order: itemOrders.get(normalizedName)!,
              listId: item.listId, // Keep the listId of the first occurrence
              sources: sameItems.map((i) => ({
                listId: i.listId,
                itemId: i.id,
                quantity: i.quantity,
                isPurchased: i.isPurchased,
              })),
            });
          }
        }
      }

      // Sort consolidated items by their order
      consolidatedItems.sort((a, b) => a.order - b.order);

      return { success: true, data: consolidatedItems };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get consolidated items",
      };
    }
  }

  /**
   * Get items grouped by source list
   * @param sessionId Session ID
   * @returns Result with items grouped by list
   */
  async getItemsBySourceList(sessionId: string): Promise<Result<any>> {
    try {
      // Get all lists in the session
      const listIds = await this.sessionRepository.getSessionLists(sessionId);

      // Get all lists and their items
      const result: any = {};

      for (const listId of listIds) {
        const list = await this.listRepository.findById(listId);
        if (list) {
          const items = await this.itemRepository.findByList(listId);

          // Only include purchased items
          const purchasedItems = items.filter((item) => item.isPurchased);

          if (purchasedItems.length > 0) {
            result[listId] = {
              list,
              items: purchasedItems,
            };
          }
        }
      }

      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get items by source list",
      };
    }
  }

  /**
   * Add a user as an owner of a list
   * @param listId List ID
   * @param userId User ID
   */
  private async addListOwner(listId: string, userId: string): Promise<void> {
    const now = new Date();
    await db.listOwners.add({
      id: generateUUID(),
      listId,
      userId,
      addedAt: now,
      createdAt: now,
      updatedAt: now,
      lastModifiedAt: now,
    });
  }
}
