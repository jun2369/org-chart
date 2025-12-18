import React, { useState, useEffect } from 'react';
import { Region, RegionFormData, OrgNode } from '../types';
import {
  loadRegions,
  saveRegions,
  addRegion,
  updateRegionName,
  deleteRegion
} from '../utils/regionStorage';
import { Toast } from './Toast';
import './RegionList.css';

// Count all nodes recursively (including root)
const countAllNodes = (node: OrgNode): number => {
  let count = 1; // Count self
  if (node.children) {
    node.children.forEach(child => {
      count += countAllNodes(child);
    });
  }
  return count;
};

// Get total count for a region (including all nodes)
const getRegionTotalCount = (region: Region): number => {
  return countAllNodes(region.orgData);
};

interface RegionListProps {
  onSelectRegion: (regionId: string) => void;
}

export const RegionList: React.FC<RegionListProps> = ({ onSelectRegion }) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegionFormData>({ name: '' });
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const loaded = loadRegions();
    setRegions(loaded);
  }, []);

  // Auto-save is handled in OrgChart component
  // This manual save ensures all data is saved and provides user feedback

  const handleAdd = () => {
    if (formData.name.trim()) {
      const updated = addRegion(regions, formData.name.trim());
      setRegions(updated);
      setFormData({ name: '' });
      setShowAddForm(false);
    }
  };

  const handleEdit = (region: Region) => {
    setEditingId(region.id);
    setFormData({ name: region.name });
  };

  const handleSaveEdit = (regionId: string) => {
    if (formData.name.trim()) {
      const updated = updateRegionName(regions, regionId, formData.name.trim());
      setRegions(updated);
      setEditingId(null);
      setFormData({ name: '' });
    }
  };

  // Check if region has employees (has children nodes)
  const hasEmployees = (region: Region): boolean => {
    const orgData = region.orgData;
    // Check if root has children and they are not empty
    if (orgData.children && orgData.children.length > 0) {
      return true;
    }
    // Check if root itself is not just a placeholder (has meaningful data beyond default)
    // If root name is same as region name and position is 'Manager' with no children, it's empty
    if (orgData.name === region.name && 
        orgData.position === 'Manager' && 
        (!orgData.children || orgData.children.length === 0)) {
      return false;
    }
    return true;
  };

  const handleDelete = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    if (!region) return;
    
    if (hasEmployees(region)) {
      setToast({
        message: 'Cannot delete this branch. It contains employees. Please remove all employees first.',
        type: 'error'
      });
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this branch?')) {
      const updated = deleteRegion(regions, regionId);
      setRegions(updated);
      setToast({
        message: 'Branch deleted successfully.',
        type: 'success'
      });
    }
  };

  const handleSave = () => {
    // Force save all regions to ensure latest state is persisted
    saveRegions(regions);
    
    // Also ensure all region org data is saved by reloading and saving
    const currentRegions = loadRegions();
    saveRegions(currentRegions);
    
    setToast({
      message: 'All branches and organization data have been saved successfully!',
      type: 'success'
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: '' });
  };

  return (
    <div className="region-list-container">
      <div className="region-list-header">
        <h1>Organization Chart - Branches</h1>
        <div className="header-actions">
          {!showAddForm && !editingId && (
            <>
              <button className="btn-save" onClick={handleSave}>
                💾 Save All
              </button>
              <button className="btn-add-region" onClick={() => setShowAddForm(true)}>
                + Add Branch
              </button>
            </>
          )}
        </div>
      </div>

      <div className="region-list-content">
        {(showAddForm || editingId) && (
          <div className="region-form">
            <input
              type="text"
              placeholder="Branch Name"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (editingId) {
                    handleSaveEdit(editingId);
                  } else {
                    handleAdd();
                  }
                }
              }}
              autoFocus
            />
            <div className="form-actions">
              <button
                className="btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={() => {
                  if (editingId) {
                    handleSaveEdit(editingId);
                  } else {
                    handleAdd();
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        <div className="region-grid">
          {regions.map((region) => (
            <div key={region.id} className="region-card">
              {editingId === region.id ? (
                <div className="region-form-inline">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(region.id);
                      }
                    }}
                    autoFocus
                  />
                  <div className="form-actions">
                    <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                    <button className="btn-confirm" onClick={() => handleSaveEdit(region.id)}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="region-card-content">
                    <h2>
                      {region.name}
                      <span className="region-count"> ({getRegionTotalCount(region)})</span>
                    </h2>
                    <p>Click to view organization chart</p>
                  </div>
                  <div className="region-card-actions">
                    <button
                      className="btn-enter"
                      onClick={() => onSelectRegion(region.id)}
                    >
                      Enter
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(region)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className={`btn-delete ${hasEmployees(region) ? 'disabled' : ''}`}
                      onClick={() => handleDelete(region.id)}
                      title={hasEmployees(region) ? 'Cannot delete branch with employees' : 'Delete'}
                      disabled={hasEmployees(region)}
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

