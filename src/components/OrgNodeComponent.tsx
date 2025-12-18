import React, { useState, useMemo } from 'react';
import { OrgNode, NodeAction } from '../types';
import { getGradientStyle } from '../utils/colors';
import { getDepartment, getDepartmentColor } from '../utils/department';
import './OrgNodeComponent.css';

// Count all subordinates recursively (including indirect subordinates)
const countAllSubordinates = (node: OrgNode): number => {
  if (!node.children || node.children.length === 0) {
    return 0;
  }
  let count = 0;
  node.children.forEach(child => {
    count += 1; // Count direct subordinate
    count += countAllSubordinates(child); // Count indirect subordinates
  });
  return count;
};

interface OrgNodeComponentProps {
  node: OrgNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (action: NodeAction, nodeId: string) => void;
  level?: number;
  onDragStart?: (nodeId: string) => void;
  onDragEnd?: () => void;
  onDragOver?: (nodeId: string, position: 'above' | 'below') => void;
  onDrop?: (targetNodeId: string, position: 'above' | 'below') => void;
  dragTargetId?: string | null;
  dragPosition?: 'above' | 'below' | null;
  isDragging?: boolean;
  draggedNodeId?: string | null;
}

export const OrgNodeComponent: React.FC<OrgNodeComponentProps> = ({
  node,
  selectedId,
  onSelect,
  onAction,
  level = 0,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  dragTargetId,
  dragPosition,
  isDragging,
  draggedNodeId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [localDragPosition, setLocalDragPosition] = useState<'above' | 'below' | null>(null);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const department = getDepartment(node);
  const isDragTarget = dragTargetId === node.id;
  const currentDragPosition = dragPosition || localDragPosition;
  const subordinateCount = countAllSubordinates(node);

  // Group children by department
  const groupedChildren = useMemo(() => {
    if (!hasChildren || !node.children) return null;
    
    const groups: { [key: string]: OrgNode[] } = {};
    const noDepartment: OrgNode[] = [];
    
    node.children.forEach(child => {
      const childDept = getDepartment(child);
      if (childDept) {
        if (!groups[childDept]) {
          groups[childDept] = [];
        }
        groups[childDept].push(child);
      } else {
        noDepartment.push(child);
      }
    });
    
    // Check if each department group should be horizontal
    // Rule 1: If parent has > 2 children, arrange them horizontally
    // Rule 2: If all nodes in the group have <= 2 children, arrange horizontally
    const shouldBeHorizontal: { [key: string]: boolean } = {};
    Object.entries(groups).forEach(([dept, children]) => {
      // Rule 1: If parent has more than 2 children, arrange horizontally
      const parentHasManyChildren = children.length > 2;
      
      // Rule 2: If all nodes in this department have <= 2 children, arrange horizontally
      const allHaveFewChildren = children.every(child => {
        const childCount = child.children ? child.children.length : 0;
        return childCount <= 2;
      });
      
      // Apply horizontal if either rule is met
      shouldBeHorizontal[dept] = (parentHasManyChildren || allHaveFewChildren) && children.length > 0;
    });
    
    return { groups, noDepartment, shouldBeHorizontal };
  }, [node.children, hasChildren]);

  const handleNodeClick = (e: React.MouseEvent) => {
    // Don't select if we just finished dragging
    if (isDragging) return;
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleActionClick = (e: React.MouseEvent, action: NodeAction) => {
    e.stopPropagation();
    onAction(action, node.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (level === 0) return; // Cannot drag root node
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
    if (onDragStart) {
      onDragStart(node.id);
    }
  };

  const handleDragEnd = () => {
    setLocalDragPosition(null);
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (level === 0 || !onDragOver) return; // Cannot drop on root node
    
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const threshold = height / 2;

    const position: 'above' | 'below' = y < threshold ? 'above' : 'below';
    setLocalDragPosition(position);
    onDragOver(node.id, position);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedNodeId = e.dataTransfer.getData('text/plain');
    if (draggedNodeId === node.id) return; // Cannot drop on itself
    
    const position = currentDragPosition || 'below';
    setLocalDragPosition(null);
    
    if (onDrop) {
      onDrop(node.id, position);
    }
  };

  const handleDragLeave = () => {
    // Only clear local position if not the global drag target
    if (!isDragTarget) {
      setLocalDragPosition(null);
    }
  };

  return (
    <div className="org-node-wrapper">
      {/* Drop indicator above */}
      {isDragTarget && currentDragPosition === 'above' && (
        <div className="drop-indicator drop-indicator-above">
          <div className="drop-indicator-line"></div>
          <div className="drop-indicator-label">移动到此处（成为平级）</div>
        </div>
      )}
      
      <div className="org-node-container">
        {/* Department label above card */}
        {department && (
          <div className="department-label" style={{ color: getDepartmentColor(department) }}>
            {department}
          </div>
        )}
        
        <div
          className={`org-node ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragTarget ? 'drag-target' : ''}`}
          onClick={handleNodeClick}
          style={getGradientStyle(level)}
          draggable={level > 0}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          <div className="node-content">
            <div className="node-name">
              {node.name}
              {subordinateCount > 0 && (
                <span className="node-subordinate-count"> ({subordinateCount})</span>
              )}
            </div>
            <div className="node-position">{node.position}</div>
            {node.notes && (
              <div className="node-notes">{node.notes}</div>
            )}
          </div>
          
          {isSelected && (
            <div className="node-actions" onClick={(e) => e.stopPropagation()}>
              {level > 0 && (
                <button
                  className="action-btn add-sibling"
                  onClick={(e) => handleActionClick(e, 'add-sibling')}
                  title="Add Sibling Node"
                >
                  +
                </button>
              )}
              <button
                className="action-btn add-child"
                onClick={(e) => handleActionClick(e, 'add-child')}
                title="Add Subordinate"
              >
                ⬇
              </button>
              {level > 0 && (
                <button
                  className="action-btn move-up"
                  onClick={(e) => handleActionClick(e, 'move-up')}
                  title="移动到上一级"
                >
                  ↑
                </button>
              )}
              {level > 0 && (
                <button
                  className="action-btn move-down"
                  onClick={(e) => handleActionClick(e, 'move-down')}
                  title="移动到平级节点下"
                >
                  ↓
                </button>
              )}
              <button
                className="action-btn edit"
                onClick={(e) => handleActionClick(e, 'edit')}
                title="Edit"
              >
                ✎
              </button>
              {level > 0 && (
                <button
                  className="action-btn delete"
                  onClick={(e) => handleActionClick(e, 'delete')}
                  title="Delete"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {hasChildren && (
            <button
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>

        {/* Drop indicator below */}
        {isDragTarget && currentDragPosition === 'below' && (
          <div className="drop-indicator drop-indicator-below">
            <div className="drop-indicator-line"></div>
            <div className="drop-indicator-label">移动到此处（成为下级）</div>
          </div>
        )}

        {hasChildren && isExpanded && (
          <div className="org-node-children">
            {groupedChildren ? (
              <>
                {/* Render grouped children by department */}
                {Object.entries(groupedChildren.groups).map(([dept, children]) => {
                  const isHorizontal = groupedChildren.shouldBeHorizontal[dept];
                  return (
                    <div key={dept} className={`department-group ${isHorizontal ? 'department-group-horizontal' : ''}`}>
                      {children.map((child, index) => (
                        <React.Fragment key={child.id}>
                          {index === 0 && <div className="connector-line"></div>}
                          <OrgNodeComponent
                            node={child}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onAction={onAction}
                            level={level + 1}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            dragTargetId={dragTargetId}
                            dragPosition={dragPosition}
                            isDragging={isDragging}
                            draggedNodeId={draggedNodeId}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  );
                })}
                
                {/* Render children without department */}
                {groupedChildren.noDepartment.length > 0 && (
                  <div className={`department-group ${groupedChildren.noDepartment.length > 2 ? 'department-group-horizontal' : ''}`}>
                    {groupedChildren.noDepartment.map((child, index) => (
                      <React.Fragment key={child.id}>
                        {index === 0 && <div className="connector-line"></div>}
                        <OrgNodeComponent
                          node={child}
                          selectedId={selectedId}
                          onSelect={onSelect}
                          onAction={onAction}
                          level={level + 1}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          onDragOver={onDragOver}
                          onDrop={onDrop}
                          dragTargetId={dragTargetId}
                          dragPosition={dragPosition}
                          isDragging={isDragging}
                          draggedNodeId={draggedNodeId}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Fallback: render children normally if grouping fails */
              node.children!.map((child) => (
                <React.Fragment key={child.id}>
                  <div className="connector-line"></div>
                  <OrgNodeComponent
                    node={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onAction={onAction}
                    level={level + 1}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    dragTargetId={dragTargetId}
                    dragPosition={dragPosition}
                    isDragging={isDragging}
                  />
                </React.Fragment>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

