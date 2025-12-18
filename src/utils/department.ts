import { OrgNode } from '../types';

// Extract department from department field only
// Only show department label if department field has a value
export const getDepartment = (node: OrgNode): string | null => {
  // Only return department if the department field exists and is not empty
  if (node.department && node.department.trim() !== '') {
    return node.department;
  }
  
  return null;
};

// Get department color
export const getDepartmentColor = (department: string): string => {
  const dept = department.toLowerCase();
  if (dept.includes('export')) {
    return '#4a90e2'; // Blue for Export
  }
  if (dept.includes('import')) {
    return '#e74c3c'; // Red for Import
  }
  return '#2d8fd6'; // Default blue
};

