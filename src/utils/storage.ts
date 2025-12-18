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

// Move node up one level (become child of target node, which should be a sibling of parent)
export const moveNodeUp = (root: OrgNode, nodeId: string, targetParentId: string): OrgNode => {
  // Cannot move root node
  if (root.id === nodeId) {
    return root;
  }

  const node = findNodeById(root, nodeId);
  const parent = findParentNode(root, nodeId);
  const targetParent = findNodeById(root, targetParentId);

  if (!node || !parent || !targetParent) {
    return root;
  }

  // Remove node from parent's children
  const removeFromParent = (current: OrgNode): OrgNode => {
    if (current.id === parent.id) {
      return {
        ...current,
        children: (current.children || []).filter(child => child.id !== nodeId)
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => removeFromParent(child))
      };
    }
    return current;
  };

  // Add node as child of target parent
  const addToTargetParent = (current: OrgNode): OrgNode => {
    if (current.id === targetParentId) {
      return {
        ...current,
        children: [...(current.children || []), { ...node }]
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => addToTargetParent(child))
      };
    }
    return current;
  };

  let newRoot = removeFromParent(root);
  newRoot = addToTargetParent(newRoot);
  return newRoot;
};

// Move node down one level (become child of target sibling)
export const moveNodeDown = (root: OrgNode, nodeId: string, targetParentId: string): OrgNode => {
  // Cannot move root node
  if (root.id === nodeId) {
    return root;
  }

  const node = findNodeById(root, nodeId);
  const parent = findParentNode(root, nodeId);
  const targetParent = findNodeById(root, targetParentId);

  if (!node || !parent || !targetParent) {
    return root;
  }

  // Verify target parent is a sibling
  const siblings = (parent.children || []).map(child => child.id);
  if (!siblings.includes(targetParentId)) {
    return root; // Target is not a sibling
  }

  // Remove node from parent's children
  const removeFromParent = (current: OrgNode): OrgNode => {
    if (current.id === parent.id) {
      return {
        ...current,
        children: (current.children || []).filter(child => child.id !== nodeId)
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => removeFromParent(child))
      };
    }
    return current;
  };

  // Add node as child of target parent
  const addToTargetParent = (current: OrgNode): OrgNode => {
    if (current.id === targetParentId) {
      return {
        ...current,
        children: [...(current.children || []), { ...node }]
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => addToTargetParent(child))
      };
    }
    return current;
  };

  let newRoot = removeFromParent(root);
  newRoot = addToTargetParent(newRoot);
  return newRoot;
};

// Move node to become child of a sibling (same level, different parent)
export const moveToSiblingChild = (root: OrgNode, nodeId: string, targetParentId: string): OrgNode => {
  if (root.id === nodeId) {
    return root;
  }

  const node = findNodeById(root, nodeId);
  const parent = findParentNode(root, nodeId);
  const targetParent = findNodeById(root, targetParentId);

  if (!node || !parent || !targetParent) {
    return root;
  }

  // Verify target parent is a sibling (same level)
  const siblings = (parent.children || []).map(child => child.id);
  if (!siblings.includes(targetParentId)) {
    return root;
  }

  // Remove node from parent's children
  const removeFromParent = (current: OrgNode): OrgNode => {
    if (current.id === parent.id) {
      return {
        ...current,
        children: (current.children || []).filter(child => child.id !== nodeId)
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => removeFromParent(child))
      };
    }
    return current;
  };

  // Add node as child of target parent
  const addToTargetParent = (current: OrgNode): OrgNode => {
    if (current.id === targetParentId) {
      return {
        ...current,
        children: [...(current.children || []), { ...node }]
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => addToTargetParent(child))
      };
    }
    return current;
  };

  let newRoot = removeFromParent(root);
  newRoot = addToTargetParent(newRoot);
  return newRoot;
};

// Move node to parent level (become sibling of parent, i.e., move directly to grandparent)
export const moveToParentLevel = (root: OrgNode, nodeId: string, grandparentId: string): OrgNode => {
  if (root.id === nodeId) {
    return root;
  }

  const node = findNodeById(root, nodeId);
  const parent = findParentNode(root, nodeId);
  const grandparent = findNodeById(root, grandparentId);

  if (!node || !parent || !grandparent) {
    return root;
  }

  // Verify grandparent is actually the parent's parent
  const actualGrandparent = findParentNode(root, parent.id);
  if (!actualGrandparent || actualGrandparent.id !== grandparentId) {
    return root;
  }

  // Remove node from parent's children
  const removeFromParent = (current: OrgNode): OrgNode => {
    if (current.id === parent.id) {
      return {
        ...current,
        children: (current.children || []).filter(child => child.id !== nodeId)
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => removeFromParent(child))
      };
    }
    return current;
  };

  // Add node as child of grandparent (becomes sibling of parent)
  const addToGrandparent = (current: OrgNode): OrgNode => {
    if (current.id === grandparentId) {
      return {
        ...current,
        children: [...(current.children || []), { ...node }]
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => addToGrandparent(child))
      };
    }
    return current;
  };

  let newRoot = removeFromParent(root);
  newRoot = addToGrandparent(newRoot);
  return newRoot;
};

// Reorder sibling: move node to a new position among siblings
export const reorderSibling = (root: OrgNode, nodeId: string, targetSiblingId: string, position: 'before' | 'after'): OrgNode => {
  if (root.id === nodeId) {
    return root;
  }

  const node = findNodeById(root, nodeId);
  const parent = findParentNode(root, nodeId);

  if (!node || !parent) {
    return root;
  }

  // Get all siblings
  const siblings = (parent.children || []).filter(child => child.id !== nodeId);
  const targetIndex = siblings.findIndex(s => s.id === targetSiblingId);
  
  if (targetIndex === -1) {
    return root;
  }

  // Create new siblings array with node inserted at the right position
  const newSiblings = [...siblings];
  const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
  newSiblings.splice(insertIndex, 0, node);

  // Update parent with new children order
  const updateParent = (current: OrgNode): OrgNode => {
    if (current.id === parent.id) {
      return {
        ...current,
        children: newSiblings
      };
    }
    if (current.children) {
      return {
        ...current,
        children: current.children.map(child => updateParent(child))
      };
    }
    return current;
  };

  return updateParent(root);
};

// Move node with children promotion: children are promoted to parent level when node is moved
export const moveNodeWithChildrenPromotion = (
  root: OrgNode,
  nodeId: string,
  targetParentId: string | null,
  position: 'above' | 'below'
): OrgNode => {
  if (root.id === nodeId) {
    return root; // Cannot move root
  }

  const node = findNodeById(root, nodeId);
  if (!node) return root;

  const parent = findParentNode(root, nodeId);
  if (!parent) return root;

  // Step 1: Save children (deep copy) before deletion
  const children = node.children ? node.children.map(child => JSON.parse(JSON.stringify(child))) : [];

  // Step 2: Create node copy without children
  const nodeWithoutChildren: OrgNode = {
    ...node,
    children: []
  };

  // Step 3: Remove the node (this will also remove its children)
  let newRoot = deleteNode(root, nodeId);

  // Step 4: Promote children to parent level (make them siblings of where the node was)
  if (children.length > 0) {
    children.forEach(child => {
      newRoot = addChildNode(newRoot, parent.id, child);
    });
  }

  // Step 5: Add the node (without children) to the new location
  if (position === 'above') {
    // Move to become sibling of target (move to target's parent level)
    const targetParent = targetParentId ? findParentNode(newRoot, targetParentId) : null;
    if (targetParent) {
      newRoot = addChildNode(newRoot, targetParent.id, nodeWithoutChildren);
    } else {
      // Cannot move to root level
      return root; // Restore original
    }
  } else {
    // Move to become child of target
    if (targetParentId) {
      newRoot = addChildNode(newRoot, targetParentId, nodeWithoutChildren);
    } else {
      return root; // Invalid target
    }
  }

  return newRoot;
};

