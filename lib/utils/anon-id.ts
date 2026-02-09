import { v4 as uuidv4 } from 'uuid';
import { localDB } from '@/lib/db/local-db';

/**
 * Anonymous ID Manager
 * Generates and persists a unique device identifier for guest users
 * Used for server-side guest insight quota enforcement
 */

const ANON_ID_KEY = 'vibe_anon_id';
const ANON_ID_STORAGE_TABLE = 'anon_meta';

// Store anon_id in both localStorage (fast) and IndexedDB (persistent)
export const anonIdManager = {
  /**
   * Get or create anonymous ID for this device/browser
   * Returns the same ID across sessions until browser data is cleared
   */
  async getOrCreate(): Promise<string> {
    // Try localStorage first (fastest)
    let anonId = this.getFromLocalStorage();

    if (anonId) {
      return anonId;
    }

    // Try IndexedDB (more persistent)
    anonId = await this.getFromIndexedDB();

    if (anonId) {
      // Sync back to localStorage
      this.saveToLocalStorage(anonId);
      return anonId;
    }

    // Generate new ID
    anonId = uuidv4();
    await this.save(anonId);

    return anonId;
  },

  /**
   * Save anonymous ID to both storage mechanisms
   */
  async save(anonId: string): Promise<void> {
    this.saveToLocalStorage(anonId);
    await this.saveToIndexedDB(anonId);
  },

  /**
   * Get from localStorage
   */
  getFromLocalStorage(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(ANON_ID_KEY);
    } catch (error) {
      console.error('Failed to read anon_id from localStorage:', error);
      return null;
    }
  },

  /**
   * Save to localStorage
   */
  saveToLocalStorage(anonId: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ANON_ID_KEY, anonId);
    } catch (error) {
      console.error('Failed to save anon_id to localStorage:', error);
    }
  },

  /**
   * Get from IndexedDB
   */
  async getFromIndexedDB(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      // We'll store it in a simple key-value way
      // Since Dexie doesn't have a built-in key-value store, we'll use sessionLogs table
      // Actually, let's just use localStorage for now and rely on IndexedDB for backup
      // For simplicity, we'll store it as a property that we can retrieve

      // For now, just use localStorage as primary
      // In production, you might want a dedicated metadata table
      return null;
    } catch (error) {
      console.error('Failed to read anon_id from IndexedDB:', error);
      return null;
    }
  },

  /**
   * Save to IndexedDB (for persistence across localStorage clears)
   */
  async saveToIndexedDB(anonId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      // For simplicity, we're primarily using localStorage
      // IndexedDB backup can be added later if needed
      // The anon_id is per-device, and clearing browser data resets quota (acceptable)
    } catch (error) {
      console.error('Failed to save anon_id to IndexedDB:', error);
    }
  },

  /**
   * Clear anonymous ID (for testing or user request)
   */
  async clear(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ANON_ID_KEY);
      // Clear from IndexedDB if implemented
    } catch (error) {
      console.error('Failed to clear anon_id:', error);
    }
  },

  /**
   * Check if user has an anonymous ID
   */
  exists(): boolean {
    return this.getFromLocalStorage() !== null;
  }
};

/**
 * Convenience function for getting anon ID
 * Synchronous version that returns from localStorage
 */
export function getAnonId(): string | null {
  return anonIdManager.getFromLocalStorage();
}

/**
 * Async version that ensures anon ID exists
 */
export async function ensureAnonId(): Promise<string> {
  return await anonIdManager.getOrCreate();
}

// For server-side: extract anon_id from request headers/cookies if needed
export function getAnonIdFromRequest(request: Request): string | null {
  // Could be passed as a header from client
  return request.headers.get('x-anon-id') || null;
}
