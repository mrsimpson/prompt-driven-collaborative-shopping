import Dexie, { type Table } from 'dexie';

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  last_modified_at: Date;
}

export class AppDatabase extends Dexie {
  users!: Table<User>;

  constructor() {
    super('sharemycart');
    this.version(1).stores({
      users: 'id, email, username',
    });
  }
}

export const db = new AppDatabase();