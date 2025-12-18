import { Region } from '../types';

// Use a simple in-memory store for sharing (in production, this would be a backend API)
// For now, we'll use a combination of localStorage with shared keys
const SHARED_STORAGE_PREFIX = 'org-chart-shared-';

// Generate a shareable ID
export const generateShareId = (): string => {
  return `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Save regions to shared storage
export const saveToSharedStorage = (shareId: string, regions: Region[]): void => {
  try {
    const key = `${SHARED_STORAGE_PREFIX}${shareId}`;
    localStorage.setItem(key, JSON.stringify({
      data: regions,
      updatedAt: Date.now()
    }));
  } catch (error) {
    console.error('Failed to save to shared storage:', error);
  }
};

// Load regions from shared storage
export const loadFromSharedStorage = (shareId: string): Region[] | null => {
  try {
    const key = `${SHARED_STORAGE_PREFIX}${shareId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.data;
    }
  } catch (error) {
    console.error('Failed to load from shared storage:', error);
  }
  return null;
};

// Update URL with share ID
export const updateUrlWithShareId = (shareId: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set('share', shareId);
  window.history.replaceState(null, '', url.toString());
};

// Get share ID from URL
export const getShareIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('share');
};

// Check if we should use shared storage
export const shouldUseSharedStorage = (): boolean => {
  return getShareIdFromUrl() !== null;
};

