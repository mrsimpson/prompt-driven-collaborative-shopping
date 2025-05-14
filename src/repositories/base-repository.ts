import { Table } from "dexie";
import { BaseEntity } from "../types/models";
import { generateUUID } from "../utils/uuid";

/**
 * Base repository interface for CRUD operations
 */
export interface BaseRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  findActive(): Promise<T[]>;
  save(entity: Partial<T>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  softDelete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}

/**
 * Base repository implementation using Dexie.js
 */
export abstract class DexieBaseRepository<T extends BaseEntity>
  implements BaseRepository<T>
{
  protected table: Table<T, string>;

  constructor(table: Table<T, string>) {
    this.table = table;
  }

  /**
   * Find an entity by ID
   * @param id The entity ID
   * @returns The entity or null if not found
   */
  async findById(id: string): Promise<T | null> {
    const entity = await this.table.get(id);
    return entity || null;
  }

  /**
   * Find all entities (including soft-deleted)
   * @returns Array of all entities
   */
  async findAll(): Promise<T[]> {
    return this.table.toArray();
  }

  /**
   * Find all active (non-deleted) entities
   * @returns Array of active entities
   */
  async findActive(): Promise<T[]> {
    // Use Dexie's collection method to create a more efficient query
    // This leverages database indexes instead of loading all records into memory
    // We need to use type assertions to satisfy TypeScript's type checking
    return this.table
      .where("deletedAt")
      .anyOf([null, undefined] as any[])
      .toArray();
  }

  /**
   * Save a new entity or update an existing one
   * @param entity The entity to save
   * @returns The saved entity
   */
  async save(entity: Partial<T>): Promise<T> {
    const now = new Date();
    const isNew = !entity.id;

    const fullEntity = {
      ...entity,
      id: entity.id || generateUUID(),
      createdAt: isNew ? now : entity.createdAt || now,
      updatedAt: now,
      lastModifiedAt: now,
    } as T;

    await this.table.put(fullEntity);
    return fullEntity;
  }

  /**
   * Update an existing entity
   * @param id The entity ID
   * @param updates The updates to apply
   * @returns The updated entity
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with ID ${id} not found`);
    }

    const now = new Date();
    const updatedEntity = {
      ...entity,
      ...updates,
      updatedAt: now,
      lastModifiedAt: now,
    };

    await this.table.put(updatedEntity);
    return updatedEntity;
  }

  /**
   * Soft delete an entity
   * @param id The entity ID
   */
  async softDelete(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new Error(`Entity with ID ${id} not found`);
    }

    const now = new Date();
    await this.table.update(id, {
      deletedAt: now,
      lastModifiedAt: now,
    } as Partial<T>);
  }

  /**
   * Hard delete an entity
   * @param id The entity ID
   */
  async hardDelete(id: string): Promise<void> {
    await this.table.delete(id);
  }
}
