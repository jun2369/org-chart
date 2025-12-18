import React, { useState, useEffect } from 'react';
import { NodeFormData } from '../types';
import './NodeEditForm.css';

interface NodeEditFormProps {
  initialData?: NodeFormData;
  onSubmit: (data: NodeFormData) => void;
  onCancel: () => void;
  title: string;
}

export const NodeEditForm: React.FC<NodeEditFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  title
}) => {
  const [formData, setFormData] = useState<NodeFormData>({
    name: initialData?.name || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    notes: initialData?.notes || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof NodeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="node-edit-form-overlay" onClick={onCancel}>
      <div className="node-edit-form" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Position *</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

