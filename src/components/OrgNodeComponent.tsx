import React, { useState } from 'react';
import { OrgNode, NodeAction } from '../types';
import { getGradientStyle } from '../utils/colors';
import './OrgNodeComponent.css';

interface OrgNodeComponentProps {
  node: OrgNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (action: NodeAction, nodeId: string) => void;
  level?: number;
}

export const OrgNodeComponent: React.FC<OrgNodeComponentProps> = ({
  node,
  selectedId,
  onSelect,
  onAction,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleActionClick = (e: React.MouseEvent, action: NodeAction) => {
    e.stopPropagation();
    onAction(action, node.id);
  };

  return (
    <div className="org-node-wrapper">
      <div className="org-node-container">
        <div
          className={`org-node ${isSelected ? 'selected' : ''}`}
          onClick={handleNodeClick}
          style={getGradientStyle(level)}
        >
          <div className="node-content">
            <div className="node-name">{node.name}</div>
            <div className="node-position">{node.position}</div>
            {node.department && (
              <div className="node-department">{node.department}</div>
            )}
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

        {hasChildren && isExpanded && (
          <div className="org-node-children">
            {node.children!.map((child) => (
              <React.Fragment key={child.id}>
                <div className="connector-line"></div>
                <OrgNodeComponent
                  node={child}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onAction={onAction}
                  level={level + 1}
                />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

