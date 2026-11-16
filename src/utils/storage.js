
/**
 * GI SMART POND
 * Local Storage Utilities
 *
 * Safe storage operations with JSON support.
 */

const STORAGE_PREFIX = 'gi-smart-pond:';

function getStorageKey(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('A valid storage key is required');
  }

  return `${STORAGE_PREFIX}${key}`;
}

export function saveData(key, value) {
  try {
    const storageKey = getStorageKey(key);
    localStorage.setItem(storageKey, JSON.stringify(value));

    return true;
  } catch (error) {
    console.error('Storage save failed:', error);
    return false;
  }
}

export function getData(key, fallback = null) {
  try {
    const storageKey = getStorageKey(key);
    const storedValue = localStorage.getItem(storageKey);

    if (storedValue === null) {
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch (error) {
    console.error('Storage read failed:', error);
    return fallback;
  }
}

export function removeData(key) {
  try {
    localStorage.removeItem(getStorageKey(key));
    return true;
  } catch (error) {
    console.error('Storage remove failed:', error);
    return false;
  }
}

export function clearAppData() {
  try {
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });

    return true;
  } catch (error) {
    console.error('Storage clear failed:', error);
    return false;
  }
}

export function hasData(key) {
  try {
    return localStorage.getItem(getStorageKey(key)) !== null;
  } catch (error) {
    console.error('Storage check failed:', error);
    return false;
  }
}
