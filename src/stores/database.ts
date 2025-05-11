import Dexie, { Table } from 'dexie';
import { 
  User, 
  Community, 
  CommunityMember, 
  ShoppingList, 
  ListOwner, 
  ListItem, 
  ShoppingSession, 
  SessionList 
} from '../types/models';

/**
 * ShareMyCartDatabase extends Dexie to provide a local database for the application
 */
export class ShareMyCartDatabase extends Dexie {
  // Define tables
  users!: Table<User, string>;
  communities!: Table<Community, string>;
  communityMembers!: Table<CommunityMember, string>;
  shoppingLists!: Table<ShoppingList, string>;
  listOwners!: Table<ListOwner, string>;
  listItems!: Table<ListItem, string>;
  shoppingSessions!: Table<ShoppingSession, string>;
  sessionLists!: Table<SessionList, string>;

  constructor() {
    super('ShareMyCartDatabase');
    
    // Define database schema
    this.version(1).stores({
      users: 'id, username, email, deletedAt, lastModifiedAt',
      communities: 'id, name, deletedAt, lastModifiedAt',
      communityMembers: 'id, communityId, userId, role, deletedAt, lastModifiedAt',
      shoppingLists: 'id, name, createdBy, communityId, isShared, isLocked, deletedAt, lastModifiedAt',
      listOwners: 'id, listId, userId, deletedAt, lastModifiedAt',
      listItems: 'id, listId, name, isPurchased, purchasedBy, deletedAt, lastModifiedAt',
      shoppingSessions: 'id, userId, status, deletedAt, lastModifiedAt',
      sessionLists: 'id, sessionId, listId, deletedAt, lastModifiedAt'
    });
  }

  /**
   * Initialize the database with a default user if none exists
   */
  async initializeDatabase(): Promise<void> {
    const userCount = await this.users.count();
    
    if (userCount === 0) {
      const now = new Date();
      
      // Create a default user
      const defaultUserId = 'default-user-id';
      await this.users.add({
        id: defaultUserId,
        username: 'Default User',
        email: 'user@example.com',
        createdAt: now,
        updatedAt: now,
        lastModifiedAt: now
      });
      
      // Create a sample shopping list
      const sampleListId = 'sample-list-id';
      await this.shoppingLists.add({
        id: sampleListId,
        name: 'My First Shopping List',
        description: 'A sample shopping list to get started',
        createdBy: defaultUserId,
        isShared: false,
        isLocked: false,
        createdAt: now,
        updatedAt: now,
        lastModifiedAt: now
      });
      
      // Make the default user an owner of the list
      await this.listOwners.add({
        id: 'sample-list-owner-id',
        listId: sampleListId,
        userId: defaultUserId,
        addedAt: now,
        createdAt: now,
        updatedAt: now,
        lastModifiedAt: now
      });
      
      // Add some sample items to the list
      await this.listItems.bulkAdd([
        {
          id: 'sample-item-1',
          listId: sampleListId,
          name: 'Milk',
          quantity: 1,
          unit: 'liter',
          isPurchased: false,
          createdAt: now,
          updatedAt: now,
          lastModifiedAt: now
        },
        {
          id: 'sample-item-2',
          listId: sampleListId,
          name: 'Bread',
          quantity: 1,
          unit: 'loaf',
          isPurchased: false,
          createdAt: now,
          updatedAt: now,
          lastModifiedAt: now
        },
        {
          id: 'sample-item-3',
          listId: sampleListId,
          name: 'Eggs',
          quantity: 12,
          unit: 'pcs',
          isPurchased: false,
          createdAt: now,
          updatedAt: now,
          lastModifiedAt: now
        }
      ]);
    }
  }
}

// Create and export a singleton instance of the database
export const db = new ShareMyCartDatabase();
