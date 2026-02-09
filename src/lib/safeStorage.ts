// Safe storage wrapper that falls back to memory when localStorage is unavailable
// This handles Safari private browsing and other security restrictions

class MemoryStorage implements Storage {
  private data: Map<string, string> = new Map();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Create safe storage instances
export const safeLocalStorage: Storage = isStorageAvailable('localStorage')
  ? window.localStorage
  : new MemoryStorage();

export const safeSessionStorage: Storage = isStorageAvailable('sessionStorage')
  ? window.sessionStorage
  : new MemoryStorage();

// Log storage availability for debugging
if (!isStorageAvailable('localStorage')) {
  console.warn('localStorage is not available. Using memory storage fallback.');
}

if (!isStorageAvailable('sessionStorage')) {
  console.warn('sessionStorage is not available. Using memory storage fallback.');
}
