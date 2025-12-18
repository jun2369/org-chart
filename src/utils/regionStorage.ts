import { Region, OrgNode } from '../types';
import { generateId } from './storage';
import { initialOrgData } from '../data/initialData';

const REGIONS_STORAGE_KEY = 'org-chart-regions';

// Load all regions from localStorage
export const loadRegions = (): Region[] => {
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

// Save all regions to localStorage
export const saveRegions = (regions: Region[]): void => {
  try {
    localStorage.setItem(REGIONS_STORAGE_KEY, JSON.stringify(regions));
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

