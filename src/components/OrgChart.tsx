import React, { useState, useEffect } from 'react';
import { OrgNode, NodeAction, NodeFormData, MoveType } from '../types';
import { OrgNodeComponent } from './OrgNodeComponent';
import { NodeEditForm } from './NodeEditForm';
import { MoveNodeDialog } from './MoveNodeDialog';
import { StatsPanel } from './StatsPanel';
import { getDepartment } from '../utils/department';
import {
  generateId,
  addChildNode,
  addSiblingNode,
  updateNode,
  deleteNode,
  findNodeById,
  findParentNode,
  moveNodeDown,
  moveToSiblingChild,
  moveToParentLevel,
  moveNodeWithChildrenPromotion
} from '../utils/storage';
import {
  loadRegions,
  getRegionById,
  updateRegionOrgData,
  saveRegions
} from '../utils/regionStorage';
import './OrgChart.css';

interface OrgChartProps {
  regionId: string;
  onBack: () => void;
}

export const OrgChart: React.FC<OrgChartProps> = ({ regionId, onBack }) => {
  const [orgData, setOrgData] = useState<OrgNode | null>(null);
  const [regionName, setRegionName] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [pendingAction, setPendingAction] = useState<{ action: NodeAction; nodeId: string } | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [selectableNodes, setSelectableNodes] = useState<OrgNode[]>([]);
  const [moveTitle, setMoveTitle] = useState('');
  const [moveType, setMoveType] = useState<MoveType>('move-to-parent');
  const [currentNodeName, setCurrentNodeName] = useState('');
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'above' | 'below' | null>(null);

  // Load data
  useEffect(() => {
    const regions = loadRegions();
    const region = getRegionById(regions, regionId);
    if (region) {
      setOrgData(region.orgData);
      setRegionName(region.name);
    }
  }, [regionId]);

  // Save data automatically when orgData changes
  useEffect(() => {
    if (orgData) {
      const regions = loadRegions();
      const updated = updateRegionOrgData(regions, regionId, orgData);
      saveRegions(updated);
    }
  }, [orgData, regionId]);

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
  };

  const handleAction = (action: NodeAction, nodeId: string) => {
    if (!orgData) return;
    
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this node? All its child nodes will also be deleted.')) {
        const newData = deleteNode(orgData, nodeId);
        setOrgData(newData);
        if (selectedId === nodeId) {
          setSelectedId(null);
        }
      }
    } else if (action === 'move-up') {
      // Handle move up: move directly to grandparent level (become sibling of parent)
      const node = findNodeById(orgData, nodeId);
      const parent = findParentNode(orgData, nodeId);
      const grandparent = parent ? findParentNode(orgData, parent.id) : null;
      
      if (!node || !parent || !grandparent) {
        alert('无法上移：没有可用的上级节点');
        return;
      }
      
      // Directly move to grandparent (no selection needed)
      const newData = moveToParentLevel(orgData, nodeId, grandparent.id);
      setOrgData(newData);
    } else if (action === 'move-down') {
      // Handle move down: show options for moving to sibling's children
      const node = findNodeById(orgData, nodeId);
      const parent = findParentNode(orgData, nodeId);
      
      if (!node || !parent) {
        alert('无法下移：没有可用的上级节点');
        return;
      }
      
      // Get all siblings (these are the possible target parents - move to their children)
      const targetNodes = (parent.children || []).filter(child => child.id !== nodeId);
      
      if (targetNodes.length === 0) {
        alert('无法下移：没有可用的平级节点');
        return;
      }
      
      setCurrentNodeName(node.name);
      setSelectableNodes(targetNodes);
      setMoveTitle('移动到平级节点下');
      setMoveType('move-to-sibling-child');
      setPendingAction({ action, nodeId });
      setShowMoveDialog(true);
    } else {
      setPendingAction({ action, nodeId });
      if (action === 'add-sibling') {
        setFormTitle('Add Sibling Node');
      } else if (action === 'add-child') {
        setFormTitle('Add Subordinate');
      } else if (action === 'edit') {
        setFormTitle('Edit Node');
      }
      setShowForm(true);
    }
  };

  const handleFormSubmit = (formData: NodeFormData) => {
    if (!pendingAction || !orgData) return;

    const { action, nodeId } = pendingAction;

    if (action === 'edit') {
      const node = findNodeById(orgData, nodeId);
      if (node) {
        const updated = updateNode(orgData, nodeId, {
          name: formData.name,
          position: formData.position,
          department: formData.department || undefined,
          notes: formData.notes || undefined
        });
        setOrgData(updated);
      }
    } else if (action === 'add-child') {
      const newNode: OrgNode = {
        id: generateId(),
        name: formData.name,
        position: formData.position,
        department: formData.department || undefined,
        notes: formData.notes || undefined,
        children: []
      };
      const updated = addChildNode(orgData, nodeId, newNode);
      setOrgData(updated);
    } else if (action === 'add-sibling') {
      const newNode: OrgNode = {
        id: generateId(),
        name: formData.name,
        position: formData.position,
        department: formData.department || undefined,
        notes: formData.notes || undefined,
        children: []
      };
      const updated = addSiblingNode(orgData, nodeId, newNode);
      setOrgData(updated);
    }

    setShowForm(false);
    setPendingAction(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setPendingAction(null);
  };

  const getFormInitialData = (): NodeFormData | undefined => {
    if (!orgData) return undefined;
    
    if (pendingAction && pendingAction.action === 'edit') {
      const node = findNodeById(orgData, pendingAction.nodeId);
      if (node) {
        return {
          name: node.name,
          position: node.position,
          department: node.department || '',
          notes: node.notes || ''
        };
      }
    }
    return undefined;
  };

  if (!orgData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="org-chart-container">
      <StatsPanel orgData={orgData} />
      
      <div className="org-chart-header">
        <button className="btn-back" onClick={onBack} title="Back to Branches">
          ← Back
        </button>
        <h1>Organization Chart - {regionName}</h1>
      </div>
      
      <div className="org-chart-content">
        <div className="org-chart-tree">
          <OrgNodeComponent
            node={orgData}
            selectedId={selectedId}
            onSelect={handleSelect}
            onAction={handleAction}
            onDragStart={(nodeId) => setDraggedNodeId(nodeId)}
            onDragEnd={() => {
              setDraggedNodeId(null);
              setDragTargetId(null);
              setDragPosition(null);
            }}
            onDragOver={(nodeId, position) => {
              // Check department restriction before setting target
              if (draggedNodeId && orgData) {
                const draggedNode = findNodeById(orgData, draggedNodeId);
                if (draggedNode) {
                  const draggedDept = getDepartment(draggedNode);
                  if (draggedDept) {
                    let targetNode: OrgNode | null = null;
                    if (position === 'above') {
                      const targetParent = findParentNode(orgData, nodeId);
                      targetNode = targetParent;
                    } else {
                      targetNode = findNodeById(orgData, nodeId);
                    }
                    
                    if (targetNode) {
                      const targetDept = getDepartment(targetNode);
                      if (targetDept && targetDept !== draggedDept) {
                        // Different departments, don't set as target
                        return;
                      }
                    }
                  }
                }
              }
              setDragTargetId(nodeId);
              setDragPosition(position);
            }}
            onDrop={(targetNodeId, position) => {
              if (!orgData || !draggedNodeId || draggedNodeId === targetNodeId) return;
              
              // Prevent dropping on own children
              const draggedNode = findNodeById(orgData, draggedNodeId);
              if (!draggedNode) return;
              
              // Check if target is a descendant of dragged node
              const isDescendant = (node: OrgNode, targetId: string): boolean => {
                if (node.id === targetId) return true;
                if (node.children) {
                  return node.children.some(child => isDescendant(child, targetId));
                }
                return false;
              };
              
              if (draggedNode.children && isDescendant(draggedNode, targetNodeId)) {
                // Cannot drop on own descendant
                setDraggedNodeId(null);
                setDragTargetId(null);
                setDragPosition(null);
                return;
              }
              
              // Check department restriction
              const draggedDept = getDepartment(draggedNode);
              if (draggedDept) {
                // If dragged node has a department, check target
                let targetNode: OrgNode | null = null;
                if (position === 'above') {
                  const targetParent = findParentNode(orgData, targetNodeId);
                  targetNode = targetParent;
                } else {
                  targetNode = findNodeById(orgData, targetNodeId);
                }
                
                if (targetNode) {
                  const targetDept = getDepartment(targetNode);
                  // If target also has a department and it's different, prevent drop
                  if (targetDept && targetDept !== draggedDept) {
                    alert(`无法移动：${draggedNode.name} 属于 ${draggedDept} 部门，不能移动到 ${targetDept} 部门下`);
                    setDraggedNodeId(null);
                    setDragTargetId(null);
                    setDragPosition(null);
                    return;
                  }
                }
              }
              
              // Use the new function that promotes children
              const newData = moveNodeWithChildrenPromotion(
                orgData,
                draggedNodeId,
                targetNodeId,
                position
              );
              
              setOrgData(newData);
              setDraggedNodeId(null);
              setDragTargetId(null);
              setDragPosition(null);
            }}
            dragTargetId={dragTargetId}
            dragPosition={dragPosition}
            isDragging={draggedNodeId !== null}
            draggedNodeId={draggedNodeId}
          />
        </div>
      </div>

      {showForm && (
        <NodeEditForm
          initialData={getFormInitialData()}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          title={formTitle}
        />
      )}

      {showMoveDialog && pendingAction && (
        <MoveNodeDialog
          title={moveTitle}
          moveType={moveType}
          nodes={selectableNodes}
          currentNodeName={currentNodeName}
          onSelect={(targetId) => {
            if (!orgData) return;
            
            const { action, nodeId } = pendingAction;
            let newData: OrgNode;
            
            if (action === 'move-down') {
              if (moveType === 'move-to-sibling-child') {
                newData = moveToSiblingChild(orgData, nodeId, targetId);
              } else {
                newData = moveNodeDown(orgData, nodeId, targetId);
              }
            } else {
              newData = orgData;
            }
            
            setOrgData(newData);
            setShowMoveDialog(false);
            setPendingAction(null);
          }}
          onCancel={() => {
            setShowMoveDialog(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
};

