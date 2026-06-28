
/**
 * idbStorage — Robust async key-value storage for the browser.
 * Strategy: IndexedDB → localStorage → in-memory fallback.
 */
const DB_NAME = "liango";
const DB_VERSION = 1;
const STORE_NAME = "kv";
const memoryStore = new Map<string, string>();
let dbPromise: Promise<IDBDatabase | null> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__liango_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase | null> {
  if (!isBrowser()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    let resolved = false;
    const safe = (v: IDBDatabase | null) => {
      if (!resolved) { resolved = true; resolve(v); }
    };
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      };
      req.onsuccess = () => safe(req.result);
      req.onerror = () => safe(null);
      req.onblocked = () => safe(null);
    } catch {
      safe(null);
    }
  });
  return dbPromise;
}


function idbGet(key: string): Promise<string | null> {
  return openDb().then(
    (db) =>
      new Promise<string | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const tx = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
          tx.onsuccess = () => resolve((tx.result as { value: string } | undefined)?.value ?? null);
          tx.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      })
  );
}
function idbSet(key: string, value: string): Promise<boolean> {
  return openDb().then(
    (db) =>
      new Promise<boolean>((resolve) => {
        if (!db) return resolve(false);
        try {
          const tx = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ key, value });
          tx.onsuccess = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      })
  );
}
function idbRemove(key: string): Promise<boolean> {
  return openDb().then(
    (db) =>
      new Promise<boolean>((resolve) => {
        if (!db) return resolve(false);
        try {
          const tx = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key);
          tx.onsuccess = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      })
  );
}
function lsGet(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function lsSet(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}
function lsRemove(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try { window.localStorage.removeItem(key); return true; } catch { return false; }
}

export type StorageBackend = "indexeddb" | "localstorage" | "memory";

export async function getStorageBackend(): Promise<StorageBackend> {
  const db = await openDb();
  if (db) return "indexeddb";
  if (isLocalStorageAvailable()) return "localstorage";
  return "memory";
}

export async function storageGetItem(key: string): Promise<string | null> {
  const fromIdb = await idbGet(key);
  if (fromIdb !== null) return fromIdb;
  const fromLs = lsGet(key);
  if (fromLs !== null) return fromLs;
  return memoryStore.get(key) ?? null;
}

export async function storageSetItem(key: string, value: string): Promise<boolean> {
  memoryStore.set(key, value);
  if (isBrowser()) {
    const idbOk = await idbSet(key, value);
    if (idbOk) return true;
  }
  return lsSet(key, value);
}

export async function storageRemoveItem(key: string): Promise<void> {
  memoryStore.delete(key);
  await idbRemove(key);
  lsRemove(key);
}

export function syncGetItem(key: string): string | null {
  return lsGet(key) ?? memoryStore.get(key) ?? null;
}
export function syncSetItem(key: string, value: string): boolean {
  memoryStore.set(key, value);
  return lsSet(key, value);
}
export function syncRemoveItem(key: string): void {
  memoryStore.delete(key);
  lsRemove(key);
}
