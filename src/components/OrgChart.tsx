import React, { useState, useEffect } from 'react';
import { OrgNode, NodeAction, NodeFormData } from '../types';
import { OrgNodeComponent } from './OrgNodeComponent';
import { NodeEditForm } from './NodeEditForm';
import {
  generateId,
  addChildNode,
  addSiblingNode,
  updateNode,
  deleteNode,
  findNodeById
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
      <div className="org-chart-header">
        <button className="btn-back" onClick={onBack} title="Back to Regions">
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
    </div>
  );
};

