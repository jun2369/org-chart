import { Region, OrgNode } from '../types';
import { generateId } from './storage';
import { initialOrgData } from '../data/initialData';
import { loadRegionsFromUrl } from './urlStorage';
import {
  getShareIdFromUrl,
  saveToSharedStorage,
  loadFromSharedStorage,
  updateUrlWithShareId,
  generateShareId
} from './sharedStorage';

const REGIONS_STORAGE_KEY = 'org-chart-regions';

// Load all regions from shared storage, URL, or localStorage
export const loadRegions = (): Region[] => {
  // First try to load from shared storage (for real-time sync)
  const shareId = getShareIdFromUrl();
  if (shareId) {
    const sharedRegions = loadFromSharedStorage(shareId);
    if (sharedRegions) {
      // Also save to localStorage for local use
      try {
        localStorage.setItem(REGIONS_STORAGE_KEY, JSON.stringify(sharedRegions));
      } catch (error) {
        console.error('Failed to save shared data to localStorage:', error);
      }
      return sharedRegions;
    }
  }

  // Second try to load from URL (for snapshot sharing)
  const urlRegions = loadRegionsFromUrl();
  if (urlRegions) {
    // Also save to localStorage for local use
    try {
      localStorage.setItem(REGIONS_STORAGE_KEY, JSON.stringify(urlRegions));
    } catch (error) {
      console.error('Failed to save URL data to localStorage:', error);
    }
    return urlRegions;
  }

  // Fallback to localStorage
  try {
    const data = localStorage.getItem(REGIONS_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load regions:', error);
  }
  // If no data, create default ORD region
  const defaultRegion: Region = {
    id: generateId(),
    name: 'ORD',
    orgData: initialOrgData
  };
  saveRegions([defaultRegion]);
  return [defaultRegion];
};

// Save all regions to localStorage and shared storage (use share ID for short URLs)
export const saveRegions = (regions: Region[]): void => {
  try {
    // Save to localStorage
    localStorage.setItem(REGIONS_STORAGE_KEY, JSON.stringify(regions));
    
    // Save to shared storage if using share ID
    const shareId = getShareIdFromUrl();
    if (shareId) {
      saveToSharedStorage(shareId, regions);
    } else {
      // If no share ID, create one and update URL (short URL with share ID)
      const newShareId = generateShareId();
      saveToSharedStorage(newShareId, regions);
      updateUrlWithShareId(newShareId);
    }
    
    // Don't save to URL hash to keep URLs short - use share ID instead
    // If user needs snapshot sharing, they can use the share ID link
  } catch (error) {
    console.error('Failed to save regions:', error);
  }
};

// Get region by ID
export const getRegionById = (regions: Region[], regionId: string): Region | null => {
  return regions.find(r => r.id === regionId) || null;
};

// Add new region
export const addRegion = (regions: Region[], name: string): Region[] => {
  const newRegion: Region = {
    id: generateId(),
    name,
    orgData: {
      id: 'root',
      name: name,
      position: 'Manager',
      children: []
    }
  };
  return [...regions, newRegion];
};

// Update region name
export const updateRegionName = (regions: Region[], regionId: string, name: string): Region[] => {
  return regions.map(r => r.id === regionId ? { ...r, name } : r);
};

// Update region org data
export const updateRegionOrgData = (regions: Region[], regionId: string, orgData: OrgNode): Region[] => {
  return regions.map(r => r.id === regionId ? { ...r, orgData } : r);
};

// Delete region
export const deleteRegion = (regions: Region[], regionId: string): Region[] => {
  return regions.filter(r => r.id !== regionId);
};

