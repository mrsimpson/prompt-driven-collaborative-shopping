import { ListItem } from "../types/models";
import { BaseRepository, DexieBaseRepository } from "./base-repository";
import { db } from "../stores/database";

/**
 * Repository interface for list items
 */
export interface ListItemRepository extends BaseRepository<ListItem> {
  findByList(listId: string): Promise<ListItem[]>;
  findByLists(listIds: string[]): Promise<ListItem[]>;
  markAsPurchased(id: string, userId: string): Promise<ListItem>;
  markAsUnpurchased(id: string): Promise<ListItem>;
  moveToList(id: string, newListId: string): Promise<ListItem>;
  updateSortOrder(id: string, sortOrder: number): Promise<ListItem>;
  reorderItems(listId: string, itemIds: string[]): Promise<void>;
}

/**
 * Dexie implementation of the list item repository
 */
export class DexieListItemRepository
  extends DexieBaseRepository<ListItem>
  implements ListItemRepository
{
  constructor() {
    super(db.listItems);
  }

  /**
   * Find items in a specific list
   * @param listId The list ID
   * @returns Array of list items
   */
  async findByList(listId: string): Promise<ListItem[]> {
    return this.table
      .where("listId")
      .equals(listId)
      .and((item) => item.deletedAt === undefined)
      .sortBy("sortOrder");
  }

  /**
   * Find items across multiple lists
   * @param listIds Array of list IDs
   * @returns Array of list items
   */
  async findByLists(listIds: string[]): Promise<ListItem[]> {
    if (listIds.length === 0) {
      return [];
    }

    return this.table
      .where("listId")
      .anyOf(listIds)
      .and((item) => item.deletedAt === undefined)
      .toArray();
  }

  /**
   * Mark an item as purchased
   * @param id The item ID
   * @param userId The user ID of the purchaser
   * @returns The updated item
   */
  async markAsPurchased(id: string, userId: string): Promise<ListItem> {
    const now = new Date();
    return this.update(id, {
      isPurchased: true,
      purchasedBy: userId,
      purchasedAt: now,
    });
  }

  /**
   * Mark an item as not purchased
   * @param id The item ID
   * @returns The updated item
   */
  async markAsUnpurchased(id: string): Promise<ListItem> {
    return this.update(id, {
      isPurchased: false,
      purchasedBy: undefined,
      purchasedAt: undefined,
    });
  }

  /**
   * Move an item to a different list
   * @param id The item ID
   * @param newListId The new list ID
   * @returns The updated item
   */
  async moveToList(id: string, newListId: string): Promise<ListItem> {
    return this.update(id, { listId: newListId });
  }

  /**
   * Update the sort order of an item
   * @param id The item ID
   * @param sortOrder The new sort order
   * @returns The updated item
   */
  async updateSortOrder(id: string, sortOrder: number): Promise<ListItem> {
    return this.update(id, { sortOrder });
  }

  /**
   * Reorder items in a list based on the provided item IDs order
   * @param listId The list ID
   * @param itemIds Array of item IDs in the desired order
   */
  async reorderItems(listId: string, itemIds: string[]): Promise<void> {
    // Start a transaction to ensure all updates are atomic
    await db.transaction("rw", db.listItems, async () => {
      // Update each item with its new sort order (1000 increment to allow for future insertions)
      for (let i = 0; i < itemIds.length; i++) {
        const itemId = itemIds[i];
        const sortOrder = (i + 1) * 1000;
        await this.updateSortOrder(itemId, sortOrder);
      }
    });
  }
}
