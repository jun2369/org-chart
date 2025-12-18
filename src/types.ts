// Organization chart node data type
export interface OrgNode {
  id: string;
  name: string;
  position: string;
  department?: string;
  notes?: string;
  children?: OrgNode[];
}

// Node edit form data
export interface NodeFormData {
  name: string;
  position: string;
  department: string;
  notes: string;
}

// Action type
export type NodeAction = 'add-sibling' | 'add-child' | 'edit' | 'delete' | 'move-up' | 'move-down' | 'move-to-sibling' | 'move-to-parent' | 'reorder-sibling';

// Move operation type
export type MoveType = 'move-to-parent' | 'move-to-sibling-child' | 'move-to-same-level' | 'reorder';

// Region data type
export interface Region {
  id: string;
  name: string;
  orgData: OrgNode;
}

// Region form data
export interface RegionFormData {
  name: string;
}

