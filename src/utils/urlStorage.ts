import { Region } from '../types';

// Compress and encode data to URL-safe string
const compressToUrl = (data: any): string => {
  try {
    const json = JSON.stringify(data);
    // Use base64 encoding (URL-safe)
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (error) {
    console.error('Failed to compress data:', error);
    return '';
  }
};

// Decompress and decode data from URL-safe string
const decompressFromUrl = (compressed: string): any => {
  try {
    // Restore base64 padding and convert back
    let base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decompress data:', error);
    return null;
  }
};

// Save regions to URL hash
export const saveRegionsToUrl = (regions: Region[]): void => {
  try {
    const compressed = compressToUrl(regions);
    if (compressed) {
      window.location.hash = `#data=${compressed}`;
      // Update URL without reload
      const newUrl = `${window.location.pathname}${window.location.search}#data=${compressed}`;
      window.history.replaceState(null, '', newUrl);
    }
  } catch (error) {
    console.error('Failed to save to URL:', error);
  }
};

// Load regions from URL hash
export const loadRegionsFromUrl = (): Region[] | null => {
  try {
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      const compressed = hash.substring(6); // Remove '#data='
      const regions = decompressFromUrl(compressed);
      if (regions && Array.isArray(regions)) {
        return regions;
      }
    }
  } catch (error) {
    console.error('Failed to load from URL:', error);
  }
  return null;
};

// Check if URL contains data
export const hasUrlData = (): boolean => {
  return window.location.hash.startsWith('#data=');
};

