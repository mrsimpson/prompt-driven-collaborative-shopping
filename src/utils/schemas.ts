import { z } from "zod";
import { ShoppingSessionStatus, ListItem, ShoppingList } from "../types/models";

/**
 * Helper function to parse dates from various formats
 */
const dateParser = (val: unknown): Date | undefined => {
  if (val instanceof Date) return val;
  if (val === null || val === undefined) return undefined;
  
  if (typeof val === 'string' || typeof val === 'number') {
    const date = new Date(val);
    if (!isNaN(date.getTime())) return date;
  }
  
  return undefined;
};

/**
 * Custom date schema that handles both Date objects and string/number representations
 */
const flexibleDate = z.preprocess(dateParser, z.date().optional());

/**
 * Base entity schema with common fields for all models
 */
export const baseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.preprocess(dateParser, z.date()),
  updatedAt: z.preprocess(dateParser, z.date()),
  deletedAt: flexibleDate,
  lastModifiedAt: z.preprocess(dateParser, z.date())
});

/**
 * Shopping list item schema
 */
export const listItemSchema = baseEntitySchema.extend({
  listId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  isPurchased: z.boolean(),
  purchasedBy: z.string().optional(),
  purchasedAt: flexibleDate,
  sortOrder: z.number()
});

/**
 * Shopping list schema
 */
export const shoppingListSchema = baseEntitySchema.extend({
  name: z.string(),
  description: z.string(),
  createdBy: z.string(),
  communityId: z.string().optional(),
  isShared: z.boolean(),
  isLocked: z.boolean()
});

/**
 * User schema
 */
export const userSchema = baseEntitySchema.extend({
  username: z.string(),
  email: z.string().email()
});

/**
 * Shopping session schema
 */
export const shoppingSessionSchema = baseEntitySchema.extend({
  userId: z.string(),
  startedAt: z.preprocess(dateParser, z.date()),
  endedAt: flexibleDate,
  status: z.nativeEnum(ShoppingSessionStatus)
});

/**
 * Session list schema
 */
export const sessionListSchema = baseEntitySchema.extend({
  sessionId: z.string(),
  listId: z.string(),
  addedAt: z.preprocess(dateParser, z.date())
});

/**
 * Array schemas for collections
 */
export const listItemsSchema = z.array(listItemSchema);
export const shoppingListsSchema = z.array(shoppingListSchema);

/**
 * Safe parsing functions that return null on failure
 */
export function safeParseListItem(data: unknown): ListItem | null {
  const result = listItemSchema.safeParse(data);
  if (result.success) {
    return result.data as unknown as ListItem;
  }
  console.warn("Invalid ListItem data:", result.error);
  return null;
}

export function safeParseShoppingList(data: unknown): ShoppingList | null {
  const result = shoppingListSchema.safeParse(data);
  if (result.success) {
    return result.data as unknown as ShoppingList;
  }
  console.warn("Invalid ShoppingList data:", result.error);
  return null;
}

export function safeParseListItems(data: unknown): ListItem[] {
  if (!Array.isArray(data)) {
    console.warn("Expected array of ListItems but got:", data);
    return [];
  }
  
  return data
    .map(item => {
      const result = listItemSchema.safeParse(item);
      if (!result.success) {
        console.warn("Invalid ListItem in array:", result.error);
        return null;
      }
      return result.data as unknown as ListItem;
    })
    .filter((item): item is ListItem => item !== null);
}

export function safeParseShoppingLists(data: unknown): ShoppingList[] {
  if (!Array.isArray(data)) {
    console.warn("Expected array of ShoppingLists but got:", data);
    return [];
  }
  
  return data
    .map(list => {
      const result = shoppingListSchema.safeParse(list);
      if (!result.success) {
        console.warn("Invalid ShoppingList in array:", result.error);
        return null;
      }
      return result.data as unknown as ShoppingList;
    })
    .filter((list): list is ShoppingList => list !== null);
}
