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
export type NodeAction = 'add-sibling' | 'add-child' | 'edit' | 'delete';

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

