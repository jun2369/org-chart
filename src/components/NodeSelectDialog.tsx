import React, { useState } from 'react';
import { OrgNode } from '../types';
import './NodeSelectDialog.css';

interface NodeSelectDialogProps {
  title: string;
  nodes: OrgNode[];
  onSelect: (nodeId: string) => void;
  onCancel: () => void;
}

export const NodeSelectDialog: React.FC<NodeSelectDialogProps> = ({
  title,
  nodes,
  onSelect,
  onCancel
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <div className="node-select-dialog-overlay" onClick={onCancel}>
      <div className="node-select-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
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
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

