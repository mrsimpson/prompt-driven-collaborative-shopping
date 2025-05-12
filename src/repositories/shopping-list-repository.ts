import { ShoppingList } from "../types/models";
import { BaseRepository, DexieBaseRepository } from "./base-repository";
import { db } from "../stores/database";

/**
 * Repository interface for shopping lists
 */
export interface ShoppingListRepository extends BaseRepository<ShoppingList> {
  findByUser(userId: string): Promise<ShoppingList[]>;
  findByCommunity(communityId: string): Promise<ShoppingList[]>;
  findSharedWithUser(userId: string): Promise<ShoppingList[]>;
  lockList(id: string): Promise<void>;
  unlockList(id: string): Promise<void>;
}

/**
 * Dexie implementation of the shopping list repository
 */
export class DexieShoppingListRepository
  extends DexieBaseRepository<ShoppingList>
  implements ShoppingListRepository
{
  constructor() {
    super(db.shoppingLists);
  }

  /**
   * Find lists created by a specific user
   * @param userId The user ID
   * @returns Array of shopping lists
   */
  async findByUser(userId: string): Promise<ShoppingList[]> {
    return this.table
      .where("createdBy")
      .equals(userId)
      .and((item) => item.deletedAt === undefined)
      .toArray();
  }

  /**
   * Find lists shared with a specific community
   * @param communityId The community ID
   * @returns Array of shopping lists
   */
  async findByCommunity(communityId: string): Promise<ShoppingList[]> {
    return this.table
      .where("communityId")
      .equals(communityId)
      .and((item) => item.deletedAt === undefined && item.isShared === true)
      .toArray();
  }

  /**
   * Find lists shared with a specific user (via list ownership)
   * @param userId The user ID
   * @returns Array of shopping lists
   */
  async findSharedWithUser(userId: string): Promise<ShoppingList[]> {
    // Get all list IDs where the user is an owner
    const listOwners = await db.listOwners
      .where("userId")
      .equals(userId)
      .and((item) => item.deletedAt === undefined)
      .toArray();

    const listIds = listOwners.map((owner) => owner.listId);

    if (listIds.length === 0) {
      return [];
    }

    // Get all lists with those IDs
    return this.table
      .where("id")
      .anyOf(listIds)
      .and((item) => item.deletedAt === undefined)
      .toArray();
  }

  /**
   * Lock a shopping list (during shopping)
   * @param id The list ID
   */
  async lockList(id: string): Promise<void> {
    await this.update(id, { isLocked: true });
  }

  /**
   * Unlock a shopping list
   * @param id The list ID
   */
  async unlockList(id: string): Promise<void> {
    await this.update(id, { isLocked: false });
  }
}
