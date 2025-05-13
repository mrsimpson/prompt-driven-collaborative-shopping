import {
  ShoppingSession,
  SessionList,
  ShoppingSessionStatus,
} from "../types/models";
import { BaseRepository, DexieBaseRepository } from "./base-repository";
import { db } from "../stores/database";
import { generateUUID } from "../utils/uuid";

/**
 * Repository interface for shopping sessions
 */
export interface ShoppingSessionRepository
  extends BaseRepository<ShoppingSession> {
  findActiveByUser(userId: string): Promise<ShoppingSession | null>;
  findWithLists(
    sessionId: string,
  ): Promise<{ session: ShoppingSession; lists: string[] }>;
  addListToSession(sessionId: string, listId: string): Promise<void>;
  removeListFromSession(sessionId: string, listId: string): Promise<void>;
  getSessionLists(sessionId: string): Promise<string[]>;
  endSession(
    sessionId: string,
    status: ShoppingSessionStatus,
  ): Promise<ShoppingSession>;
}

/**
 * Dexie implementation of the shopping session repository
 */
export class DexieShoppingSessionRepository
  extends DexieBaseRepository<ShoppingSession>
  implements ShoppingSessionRepository
{
  constructor() {
    super(db.shoppingSessions);
  }

  /**
   * Find an active shopping session for a user
   * @param userId The user ID
   * @returns The active session or null if none exists
   */
  async findActiveByUser(userId: string): Promise<ShoppingSession | null> {
    const session = await this.table
      .where("userId")
      .equals(userId)
      .and(
        (session) =>
          session.status === ShoppingSessionStatus.ACTIVE &&
          session.deletedAt === undefined,
      )
      .first();
      
    return session || null;
  }

  /**
   * Find a session with its associated lists
   * @param sessionId The session ID
   * @returns The session and array of list IDs
   */
  async findWithLists(
    sessionId: string,
  ): Promise<{ session: ShoppingSession; lists: string[] }> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const sessionLists = await db.sessionLists
      .where("sessionId")
      .equals(sessionId)
      .and((item) => item.deletedAt === undefined)
      .toArray();

    const listIds = sessionLists.map((sl) => sl.listId);

    return {
      session,
      lists: listIds,
    };
  }

  /**
   * Add a list to a shopping session
   * @param sessionId The session ID
   * @param listId The list ID to add
   */
  async addListToSession(sessionId: string, listId: string): Promise<void> {
    const now = new Date();

    const sessionList: SessionList = {
      id: generateUUID(),
      sessionId,
      listId,
      addedAt: now,
      createdAt: now,
      updatedAt: now,
      lastModifiedAt: now,
    };

    await db.sessionLists.add(sessionList);
  }

  /**
   * Remove a list from a shopping session
   * @param sessionId The session ID
   * @param listId The list ID to remove
   */
  async removeListFromSession(
    sessionId: string,
    listId: string,
  ): Promise<void> {
    const sessionList = await db.sessionLists
      .where("sessionId")
      .equals(sessionId)
      .and((item) => item.listId === listId && item.deletedAt === undefined)
      .first();

    if (sessionList) {
      await db.sessionLists.update(sessionList.id, {
        deletedAt: new Date(),
        lastModifiedAt: new Date(),
      });
    }
  }

  /**
   * Get all list IDs associated with a session
   * @param sessionId The session ID
   * @returns Array of list IDs
   */
  async getSessionLists(sessionId: string): Promise<string[]> {
    const sessionLists = await db.sessionLists
      .where("sessionId")
      .equals(sessionId)
      .and((item) => item.deletedAt === undefined)
      .toArray();

    return sessionLists.map((sl) => sl.listId);
  }

  /**
   * End a shopping session
   * @param sessionId The session ID
   * @param status The final status (completed or cancelled)
   * @returns The updated session
   */
  async endSession(
    sessionId: string,
    status: ShoppingSessionStatus,
  ): Promise<ShoppingSession> {
    return this.update(sessionId, {
      status,
      endedAt: new Date(),
    });
  }
}
