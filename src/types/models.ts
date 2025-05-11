/**
 * Core domain models for the ShareMyCart application
 */

/**
 * Base entity with common fields for all models
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  lastModifiedAt: Date;
}

/**
 * User model representing an application user
 */
export interface User extends BaseEntity {
  username: string;
  email: string;
  // Password hash is not included in the client-side model for security
}

/**
 * Community model representing a group of users who can share lists
 */
export interface Community extends BaseEntity {
  name: string;
  description: string;
}

/**
 * Community member representing a user's membership in a community
 */
export interface CommunityMember extends BaseEntity {
  communityId: string;
  userId: string;
  joinDate: Date;
  role: CommunityRole;
}

/**
 * Possible roles a user can have in a community
 */
export enum CommunityRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

/**
 * Shopping list model
 */
export interface ShoppingList extends BaseEntity {
  name: string;
  description: string;
  createdBy: string; // userId
  communityId?: string; // Optional, if shared with a community
  isShared: boolean;
  isLocked: boolean; // Locked during shopping
}

/**
 * List owner model representing a user who can edit a list
 */
export interface ListOwner extends BaseEntity {
  listId: string;
  userId: string;
  addedAt: Date;
}

/**
 * Shopping list item model
 */
export interface ListItem extends BaseEntity {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  purchasedBy?: string; // userId of the person who purchased the item
  purchasedAt?: Date; // When the item was purchased
}

/**
 * Shopping session model representing an active shopping trip
 */
export interface ShoppingSession extends BaseEntity {
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  status: ShoppingSessionStatus;
}

/**
 * Possible statuses for a shopping session
 */
export enum ShoppingSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Session list model representing a list included in a shopping session
 */
export interface SessionList extends BaseEntity {
  sessionId: string;
  listId: string;
  addedAt: Date;
}
