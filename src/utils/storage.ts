import { OrgNode } from '../types';

const STORAGE_KEY = 'org-chart-data';

// Load data from localStorage
export const loadOrgData = (): OrgNode | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load org data:', error);
  }
  return null;
};

// Save data to localStorage
export const saveOrgData = (data: OrgNode): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save org data:', error);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Find node in tree by ID
export const findNodeById = (root: OrgNode, id: string): OrgNode | null => {
  if (root.id === id) {
    return root;
  }
  
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  
  return null;
};

// Find parent node of a node
export const findParentNode = (
  root: OrgNode,
  targetId: string,
  parent: OrgNode | null = null
): OrgNode | null => {
  if (root.id === targetId) {
    return parent;
  }
  
  if (root.children) {
    for (const child of root.children) {
      const found = findParentNode(child, targetId, root);
      if (found !== null) return found;
    }
  }
  
  return null;
};

// Delete node
export const deleteNode = (root: OrgNode, targetId: string): OrgNode => {
  // Cannot delete root node
  if (root.id === targetId) {
    return root;
  }
  
  const newRoot = { ...root };
  
  if (newRoot.children) {
    newRoot.children = newRoot.children
      .filter(child => child.id !== targetId)
      .map(child => deleteNode(child, targetId));
  }
  
  return newRoot;
};

// Add child node
export const addChildNode = (root: OrgNode, parentId: string, newNode: OrgNode): OrgNode => {
  if (root.id === parentId) {
    return {
      ...root,
      children: [...(root.children || []), newNode]
    };
  }
  
  if (root.children) {
    return {
      ...root,
      children: root.children.map(child => addChildNode(child, parentId, newNode))
    };
  }
  
  return root;
};

// Add sibling node
export const addSiblingNode = (root: OrgNode, siblingId: string, newNode: OrgNode): OrgNode => {
  const parent = findParentNode(root, siblingId);
  
  if (!parent) {
    // Cannot add sibling to root node
    return root;
  }
  
  return addChildNode(root, parent.id, newNode);
};

// Update node
export const updateNode = (root: OrgNode, nodeId: string, updates: Partial<OrgNode>): OrgNode => {
  if (root.id === nodeId) {
    return { ...root, ...updates };
  }
  
  if (root.children) {
    return {
      ...root,
      children: root.children.map(child => updateNode(child, nodeId, updates))
    };
  }
  
  return root;
};

