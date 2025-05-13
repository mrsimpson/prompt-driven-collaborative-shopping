import { ShoppingList, ListItem, ListOwner } from "../types/models";
import {
  CreateListParams,
  UpdateListParams,
  CreateListItemParams,
  UpdateListItemParams,
  Result,
  ShareListParams,
} from "../types/operations";
import {
  ShoppingListRepository,
  DexieShoppingListRepository,
} from "../repositories/shopping-list-repository";
import {
  ListItemRepository,
  DexieListItemRepository,
} from "../repositories/list-item-repository";
import { db } from "../stores/database";
import { generateUUID } from "../utils/uuid";
import {
  isValidListName,
  isNotEmpty,
  isValidQuantity,
  isValidUnit,
} from "../utils/validation/validators";

/**
 * Service interface for shopping list operations
 */
export interface ShoppingListService {
  createList(
    params: CreateListParams,
    userId: string,
  ): Promise<Result<ShoppingList>>;
  updateList(
    params: UpdateListParams,
    userId: string,
  ): Promise<Result<ShoppingList>>;
  deleteList(id: string, userId: string): Promise<Result<void>>;
  getList(id: string): Promise<Result<ShoppingList>>;
  getUserLists(userId: string): Promise<Result<ShoppingList[]>>;
  getSharedLists(userId: string): Promise<Result<ShoppingList[]>>;
  getCommunityLists(communityId: string): Promise<Result<ShoppingList[]>>;

  addItemToList(params: CreateListItemParams): Promise<Result<ListItem>>;
  updateListItem(params: UpdateListItemParams): Promise<Result<ListItem>>;
  removeItemFromList(itemId: string): Promise<Result<void>>;
  getListItems(listId: string): Promise<Result<ListItem[]>>;

  shareList(params: ShareListParams): Promise<Result<void>>;
  unshareList(listId: string, userId: string): Promise<Result<void>>;
  getListOwners(listId: string): Promise<Result<string[]>>;
}

/**
 * Local implementation of the shopping list service
 */
export class LocalShoppingListService implements ShoppingListService {
  private listRepository: ShoppingListRepository;
  private itemRepository: ListItemRepository;

  constructor() {
    this.listRepository = new DexieShoppingListRepository();
    this.itemRepository = new DexieListItemRepository();
  }

  /**
   * Create a new shopping list
   * @param params List creation parameters
   * @param userId ID of the user creating the list
   * @returns Result with the created list
   */
  async createList(
    params: CreateListParams,
    userId: string,
  ): Promise<Result<ShoppingList>> {
    try {
      // Validate input
      if (!isValidListName(params.name)) {
        return { success: false, error: "Invalid list name" };
      }

      // Create the list
      const now = new Date();
      const list: Partial<ShoppingList> = {
        name: params.name,
        description: params.description || "",
        createdBy: userId,
        communityId: params.communityId,
        isShared: params.isShared,
        isLocked: false,
      };

      const savedList = await this.listRepository.save(list);

      // Make the creator an owner of the list
      const listOwner: ListOwner = {
        id: generateUUID(),
        listId: savedList.id,
        userId: userId,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
        lastModifiedAt: now,
      };

      await db.listOwners.add(listOwner);

      return { success: true, data: savedList };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create list",
      };
    }
  }

  /**
   * Update an existing shopping list
   * @param params List update parameters
   * @param userId ID of the user updating the list
   * @returns Result with the updated list
   */
  async updateList(
    params: UpdateListParams,
    userId: string,
  ): Promise<Result<ShoppingList>> {
    try {
      // Check if the list exists
      const list = await this.listRepository.findById(params.id);
      if (!list) {
        return { success: false, error: "List not found" };
      }

      // Check if the list is locked
      if (list.isLocked) {
        return { success: false, error: "Cannot update a locked list" };
      }

      // Check if the user is an owner of the list
      const isOwner = await this.isListOwner(params.id, userId);
      if (!isOwner) {
        return {
          success: false,
          error: "You do not have permission to update this list",
        };
      }

      // Validate input if provided
      if (params.name !== undefined && !isValidListName(params.name)) {
        return { success: false, error: "Invalid list name" };
      }

      // Update the list
      const updates: Partial<ShoppingList> = {};
      if (params.name !== undefined) updates.name = params.name;
      if (params.description !== undefined)
        updates.description = params.description;
      if (params.isShared !== undefined) updates.isShared = params.isShared;
      if (params.communityId !== undefined)
        updates.communityId = params.communityId;

      const updatedList = await this.listRepository.update(params.id, updates);

      return { success: true, data: updatedList };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update list",
      };
    }
  }

  /**
   * Delete a shopping list
   * @param id List ID
   * @param userId ID of the user deleting the list
   * @returns Result indicating success or failure
   */
  async deleteList(id: string, userId: string): Promise<Result<void>> {
    try {
      // Check if the list exists
      const list = await this.listRepository.findById(id);
      if (!list) {
        return { success: false, error: "List not found" };
      }

      // Check if the list is locked
      if (list.isLocked) {
        return { success: false, error: "Cannot delete a locked list" };
      }

      // Check if the user is an owner of the list
      const isOwner = await this.isListOwner(id, userId);
      if (!isOwner) {
        return {
          success: false,
          error: "You do not have permission to delete this list",
        };
      }

      // Soft delete the list
      await this.listRepository.softDelete(id);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete list",
      };
    }
  }

  /**
   * Get a shopping list by ID
   * @param id List ID
   * @returns Result with the list
   */
  async getList(id: string): Promise<Result<ShoppingList>> {
    try {
      const list = await this.listRepository.findById(id);
      if (!list || list.deletedAt) {
        return { success: false, error: "List not found" };
      }

      return { success: true, data: list };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get list",
      };
    }
  }

  /**
   * Get all lists created by a user
   * @param userId User ID
   * @returns Result with an array of lists
   */
  async getUserLists(userId: string): Promise<Result<ShoppingList[]>> {
    try {
      const lists = await this.listRepository.findByUser(userId);
      return { success: true, data: lists };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get user lists",
      };
    }
  }

  /**
   * Get all lists shared with a user
   * @param userId User ID
   * @returns Result with an array of lists
   */
  async getSharedLists(userId: string): Promise<Result<ShoppingList[]>> {
    try {
      const lists = await this.listRepository.findSharedWithUser(userId);
      return { success: true, data: lists };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get shared lists",
      };
    }
  }

  /**
   * Get all lists shared with a community
   * @param communityId Community ID
   * @returns Result with an array of lists
   */
  async getCommunityLists(
    communityId: string,
  ): Promise<Result<ShoppingList[]>> {
    try {
      const lists = await this.listRepository.findByCommunity(communityId);
      return { success: true, data: lists };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get community lists",
      };
    }
  }

  /**
   * Add an item to a shopping list
   * @param params Item creation parameters
   * @returns Result with the created item
   */
  async addItemToList(params: CreateListItemParams): Promise<Result<ListItem>> {
    try {
      // Check if the list exists
      const list = await this.listRepository.findById(params.listId);
      if (!list) {
        return { success: false, error: "List not found" };
      }

      // Check if the list is locked
      if (list.isLocked) {
        return { success: false, error: "Cannot add items to a locked list" };
      }

      // Validate input
      if (!isNotEmpty(params.name)) {
        return { success: false, error: "Item name is required" };
      }

      if (!isValidQuantity(params.quantity)) {
        return { success: false, error: "Invalid quantity" };
      }

      if (!isValidUnit(params.unit)) {
        return { success: false, error: "Invalid unit" };
      }

      // Get the highest sort order to place the new item at the end
      const existingItems = await this.itemRepository.findByList(params.listId);
      const maxSortOrder = existingItems.length > 0
        ? Math.max(...existingItems.map(item => item.sortOrder || 0))
        : 0;

      // Create the item
      const item: Partial<ListItem> = {
        listId: params.listId,
        name: params.name,
        quantity: params.quantity,
        unit: params.unit,
        isPurchased: false,
        sortOrder: params.sortOrder !== undefined ? params.sortOrder : maxSortOrder + 1000, // Use large increments to allow for easy reordering
      };

      const savedItem = await this.itemRepository.save(item);

      return { success: true, data: savedItem };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to add item to list",
      };
    }
  }

  /**
   * Update a list item
   * @param params Item update parameters
   * @returns Result with the updated item
   */
  async updateListItem(
    params: UpdateListItemParams,
  ): Promise<Result<ListItem>> {
    try {
      // Check if the item exists
      const item = await this.itemRepository.findById(params.id);
      if (!item) {
        return { success: false, error: "Item not found" };
      }

      // Check if the list is locked
      const list = await this.listRepository.findById(params.listId);
      if (list?.isLocked && params.isPurchased === undefined) {
        return {
          success: false,
          error:
            "Cannot update items in a locked list except for purchase status",
        };
      }

      // Validate input if provided
      if (params.name !== undefined && !isNotEmpty(params.name)) {
        return { success: false, error: "Item name cannot be empty" };
      }

      if (params.quantity !== undefined && !isValidQuantity(params.quantity)) {
        return { success: false, error: "Invalid quantity" };
      }

      if (params.unit !== undefined && !isValidUnit(params.unit)) {
        return { success: false, error: "Invalid unit" };
      }

      // Update the item
      const updates: Partial<ListItem> = {};
      if (params.name !== undefined) updates.name = params.name;
      if (params.quantity !== undefined) updates.quantity = params.quantity;
      if (params.unit !== undefined) updates.unit = params.unit;
      if (params.isPurchased !== undefined)
        updates.isPurchased = params.isPurchased;
      if (params.purchasedAt !== undefined)
        updates.purchasedAt = params.purchasedAt;
      if (params.sortOrder !== undefined)
        updates.sortOrder = params.sortOrder;

      const updatedItem = await this.itemRepository.update(params.id, updates);

      return { success: true, data: updatedItem };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update list item",
      };
    }
  }

  /**
   * Remove an item from a list
   * @param itemId Item ID
   * @returns Result indicating success or failure
   */
  async removeItemFromList(itemId: string): Promise<Result<void>> {
    try {
      // Check if the item exists
      const item = await this.itemRepository.findById(itemId);
      if (!item) {
        return { success: false, error: "Item not found" };
      }

      // Check if the list is locked
      const list = await this.listRepository.findById(item.listId);
      if (list?.isLocked) {
        return {
          success: false,
          error: "Cannot remove items from a locked list",
        };
      }

      // Soft delete the item
      await this.itemRepository.softDelete(itemId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove item from list",
      };
    }
  }

  /**
   * Get all items in a list
   * @param listId List ID
   * @returns Result with an array of items
   */
  async getListItems(listId: string): Promise<Result<ListItem[]>> {
    try {
      const items = await this.itemRepository.findByList(listId);
      return { success: true, data: items };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get list items",
      };
    }
  }

  /**
   * Share a list with a user
   * @param params Share parameters
   * @returns Result indicating success or failure
   */
  async shareList(params: ShareListParams): Promise<Result<void>> {
    try {
      // Check if the list exists
      const list = await this.listRepository.findById(params.listId);
      if (!list) {
        return { success: false, error: "List not found" };
      }

      // Check if the user is already an owner
      const isAlreadyOwner = await this.isListOwner(
        params.listId,
        params.userId,
      );
      if (isAlreadyOwner) {
        return {
          success: false,
          error: "User is already an owner of this list",
        };
      }

      // Add the user as an owner
      const now = new Date();
      const listOwner: ListOwner = {
        id: generateUUID(),
        listId: params.listId,
        userId: params.userId,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
        lastModifiedAt: now,
      };

      await db.listOwners.add(listOwner);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to share list",
      };
    }
  }

  /**
   * Unshare a list with a user
   * @param listId List ID
   * @param userId User ID
   * @returns Result indicating success or failure
   */
  async unshareList(listId: string, userId: string): Promise<Result<void>> {
    try {
      // Check if the list exists
      const list = await this.listRepository.findById(listId);
      if (!list) {
        return { success: false, error: "List not found" };
      }

      // Check if the user is an owner
      const listOwner = await db.listOwners
        .where("listId")
        .equals(listId)
        .and(
          (owner) => owner.userId === userId && owner.deletedAt === undefined,
        )
        .first();

      if (!listOwner) {
        return { success: false, error: "User is not an owner of this list" };
      }

      // Don't allow removing the creator of the list
      if (list.createdBy === userId) {
        return {
          success: false,
          error: "Cannot remove the creator of the list",
        };
      }

      // Soft delete the ownership
      const now = new Date();
      await db.listOwners.update(listOwner.id, {
        deletedAt: now,
        lastModifiedAt: now,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to unshare list",
      };
    }
  }

  /**
   * Get all user IDs of list owners
   * @param listId List ID
   * @returns Result with an array of user IDs
   */
  async getListOwners(listId: string): Promise<Result<string[]>> {
    try {
      const listOwners = await db.listOwners
        .where("listId")
        .equals(listId)
        .and((owner) => owner.deletedAt === undefined)
        .toArray();

      const userIds = listOwners.map((owner) => owner.userId);

      return { success: true, data: userIds };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get list owners",
      };
    }
  }

  /**
   * Check if a user is an owner of a list
   * @param listId List ID
   * @param userId User ID
   * @returns True if the user is an owner, false otherwise
   */
  private async isListOwner(listId: string, userId: string): Promise<boolean> {
    const listOwner = await db.listOwners
      .where("listId")
      .equals(listId)
      .and((owner) => owner.userId === userId && owner.deletedAt === undefined)
      .first();

    return !!listOwner;
  }
}
