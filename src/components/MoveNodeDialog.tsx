import React, { useState } from 'react';
import { OrgNode, MoveType } from '../types';
import './MoveNodeDialog.css';

interface MoveNodeDialogProps {
  title: string;
  moveType: MoveType;
  nodes: OrgNode[];
  currentNodeName: string;
  onSelect: (nodeId: string) => void;
  onCancel: () => void;
}

export const MoveNodeDialog: React.FC<MoveNodeDialogProps> = ({
  title,
  moveType,
  nodes,
  currentNodeName,
  onSelect,
  onCancel
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getDescription = () => {
    switch (moveType) {
      case 'move-to-parent':
        return `选择要将 "${currentNodeName}" 移动到的上一级节点`;
      case 'move-to-sibling-child':
        return `选择要将 "${currentNodeName}" 移动到的平级节点（将成为其下级）`;
      case 'move-to-same-level':
        return `选择要将 "${currentNodeName}" 移动到的同级位置`;
      case 'reorder':
        return `选择 "${currentNodeName}" 的新位置（调整同级顺序）`;
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <div className="move-node-dialog-overlay" onClick={onCancel}>
      <div className="move-node-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="move-description">{getDescription()}</p>
        <form onSubmit={handleSubmit}>
          <div className="node-list">
            {nodes.length === 0 ? (
              <div className="no-nodes">没有可用的节点</div>
            ) : (
              nodes.map((node) => (
                <div
                  key={node.id}
                  className={`node-option ${selectedId === node.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(node.id)}
                >
                  <div className="node-option-name">{node.name}</div>
                  <div className="node-option-position">{node.position}</div>
                </div>
              ))
            )}
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              取消
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={!selectedId}
            >
              确认移动
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

