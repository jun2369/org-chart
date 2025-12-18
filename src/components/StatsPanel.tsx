import React, { useMemo } from 'react';
import { OrgNode } from '../types';
import { getDepartment, getDepartmentColor } from '../utils/department';
import './StatsPanel.css';

interface StatsPanelProps {
  orgData: OrgNode;
}

interface DepartmentStats {
  name: string;
  count: number;
  color: string;
}


// Get all nodes recursively
const getAllNodes = (node: OrgNode): OrgNode[] => {
  const nodes = [node];
  if (node.children) {
    node.children.forEach(child => {
      nodes.push(...getAllNodes(child));
    });
  }
  return nodes;
};

export const StatsPanel: React.FC<StatsPanelProps> = ({ orgData }) => {
  const stats = useMemo(() => {
    const allNodes = getAllNodes(orgData);
    const departmentMap = new Map<string, number>();

    allNodes.forEach(node => {
      // Count by department
      const dept = getDepartment(node);
      if (dept) {
        departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1);
      }
    });

    // Convert department map to array
    const departmentStats: DepartmentStats[] = Array.from(departmentMap.entries()).map(([name, count]) => ({
      name,
      count,
      color: getDepartmentColor(name)
    }));

    return {
      departments: departmentStats
    };
  }, [orgData]);

  return (
    <div className="stats-panel">
      <div className="stats-panel-header">
        <h3>Statistics</h3>
      </div>
      
      <div className="stats-section">
        <div className="stats-section-title">Department Statistics</div>
        {stats.departments.length > 0 ? (
          <div className="stats-list">
            {stats.departments.map(dept => (
              <div key={dept.name} className="stats-item">
                <span className="stats-label" style={{ color: dept.color }}>
                  {dept.name}
                </span>
                <span className="stats-value">{dept.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="stats-empty">No department data</div>
        )}
      </div>

    </div>
  );
};

