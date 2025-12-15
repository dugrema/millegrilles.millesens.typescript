// react-view5/app/utils/idbStorage.ts

import { openDB, type IDBPDatabase } from "idb";

/**
 * An interface describing a simple IDB wrapper.
 */
export interface IDBStorage<T = unknown> {
  getItem: (key: string) => Promise<T | undefined>;
  setItem: (key: string, value: T) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

/**
 * Options to configure the database and store names.
 * The defaults match the previous implementation.
 */
export interface StoreOptions {
  dbName?: string;
  storeName?: string;
}

const DEFAULT_DB_NAME = "millesensStore";
const DEFAULT_STORE_NAME = "millesensState";

/**
 * Keeps a single promise per database name, so that
 * we never open the same database twice.
 */
const dbPromises: Record<string, Promise<IDBPDatabase>> = {};

/**
 * Lazily create / retrieve an IDB instance for a given database.
 */
/**
 * Lazily create / retrieve an IDB instance for a given database.
 * The first call creates all known stores (`millesensState` and `deviceValues`)
 * so that subsequent calls with other store names succeed.
 */
function getDB(dbName: string, storeName: string) {
  if (!dbPromises[dbName]) {
    dbPromises[dbName] = openDB(dbName, 2, {
      upgrade(db) {
        // Create the default state store if missing.
        if (!db.objectStoreNames.contains(DEFAULT_STORE_NAME)) {
          db.createObjectStore(DEFAULT_STORE_NAME);
        }
        // Create the device values store if missing.
        if (!db.objectStoreNames.contains("deviceValues")) {
          db.createObjectStore("deviceValues");
        }
      },
    });
  }
  return dbPromises[dbName];
}

/**
 * Factory that returns a lightweight wrapper around IndexedDB
 * for the specified database / object store.
 *
 * @param options Optional custom database or store names.
 */
export function createIDBStorage<T = unknown>(
  options: StoreOptions = {},
): IDBStorage<T> {
  const dbName = options.dbName ?? DEFAULT_DB_NAME;
  const storeName = options.storeName ?? DEFAULT_STORE_NAME;

  return {
    async getItem(key: string): Promise<T | undefined> {
      const db = await getDB(dbName, storeName);
      return db.get(storeName, key);
    },
    async setItem(key: string, value: T): Promise<void> {
      const db = await getDB(dbName, storeName);
      await db.put(storeName, value, key);
    },
    async removeItem(key: string): Promise<void> {
      const db = await getDB(dbName, storeName);
      await db.delete(storeName, key);
    },
  };
}

/** Exported helper to retrieve the database instance for custom stores. */
export async function getDBForStore(storeName: string): Promise<IDBPDatabase> {
  return getDB(DEFAULT_DB_NAME, storeName);
}
