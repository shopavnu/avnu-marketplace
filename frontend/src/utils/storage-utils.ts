/**
 * Storage utilities for managing localStorage and sessionStorage
 * with proper error handling and type safety
 */

/**
 * Get an item from localStorage with type safety
 * @param key Storage key
 * @param defaultValue Default value if key doesn't exist or on error
 * @returns Parsed value or default value
 */
export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage with type safety
 * @param key Storage key
 * @param value Value to store
 */
export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
  }
};

/**
 * Get an item from sessionStorage with type safety
 * @param key Storage key
 * @param defaultValue Default value if key doesn't exist or on error
 * @returns Parsed value or default value
 */
export const getSessionStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from sessionStorage for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set an item in sessionStorage with type safety
 * @param key Storage key
 * @param value Value to store
 */
export const setSessionStorage = <T>(key: string, value: T): void => {
  try {
    if (value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error(`Error writing to sessionStorage for key ${key}:`, error);
  }
};

/**
 * Check if localStorage is available in the current environment
 * @returns True if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Check if sessionStorage is available in the current environment
 * @returns True if sessionStorage is available
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};
