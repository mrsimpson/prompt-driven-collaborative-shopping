/**
 * Type definitions for operations in the ShareMyCart application
 */

import { User, ShoppingSessionStatus } from "./models";

/**
 * Result of an operation that might fail
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Parameters for creating a shopping list
 */
export interface CreateListParams {
  name: string;
  description: string;
  isShared: boolean;
  communityId?: string;
}

/**
 * Parameters for updating a shopping list
 */
export interface UpdateListParams {
  id: string;
  name?: string;
  description?: string;
  isShared?: boolean;
  communityId?: string;
}

/**
 * Parameters for creating a list item
 */
export interface CreateListItemParams {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
}

/**
 * Parameters for updating a list item
 */
export interface UpdateListItemParams {
  id: string;
  name?: string;
  quantity?: number;
  unit?: string;
  isPurchased?: boolean;
}

/**
 * Parameters for marking an item as purchased
 */
export interface MarkItemAsPurchasedParams {
  id: string;
  userId: string;
}

/**
 * Parameters for sharing a list with a user
 */
export interface ShareListParams {
  listId: string;
  userId: string;
}

/**
 * Parameters for creating a shopping session
 */
export interface CreateShoppingSessionParams {
  userId: string;
  listIds: string[];
}

/**
 * Parameters for ending a shopping session
 */
export interface EndShoppingSessionParams {
  sessionId: string;
  status: ShoppingSessionStatus;
  createNewListForUnpurchased?: boolean;
  newListName?: string;
}

/**
 * Parameters for creating a community
 */
export interface CreateCommunityParams {
  name: string;
  description: string;
  createdBy: string; // userId
}

/**
 * Parameters for adding a user to a community
 */
export interface AddCommunityMemberParams {
  communityId: string;
  userId: string;
  role: "admin" | "member";
}

/**
 * Parameters for user registration
 */
export interface RegisterUserParams {
  username: string;
  email: string;
  password: string;
}

/**
 * Parameters for user login
 */
export interface LoginParams {
  email: string;
  password: string;
}

/**
 * Authentication result
 */
export interface AuthResult extends Result<User> {
  token?: string;
}
