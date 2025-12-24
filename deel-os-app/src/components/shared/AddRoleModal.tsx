import { useState, useEffect } from 'react';
import { createRole } from '../../utils/api';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  discipline: string;
  existingRoles: string[];
}

export function AddRoleModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  discipline,
  existingRoles 
}: AddRoleModalProps) {
  const [roleName, setRoleName] = useState('');
  const [copyFrom, setCopyFrom] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setRoleName('');
      setCopyFrom('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (existingRoles.includes(roleName.trim())) {
      setError('A role with this name already exists');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createRole(discipline, roleName.trim(), copyFrom || undefined);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="edit-modal add-modal">
        <form onSubmit={handleSubmit}>
          <div className="edit-modal-header">
            <div className="edit-modal-title">
              <span>Add Role</span>
              <span className="edit-modal-subtitle">{discipline}</span>
            </div>
            <button type="button" className="edit-modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="edit-modal-body">
            <div className="form-group">
              <label htmlFor="role-name">Role Name</label>
              <input
                id="role-name"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Senior Designer, Staff Engineer"
                disabled={isSaving}
                autoFocus
              />
            </div>

            {existingRoles.length > 0 && (
              <div className="form-group">
                <label htmlFor="copy-from">Copy Structure From (Optional)</label>
                <select
                  id="copy-from"
                  value={copyFrom}
                  onChange={(e) => setCopyFrom(e.target.value)}
                  disabled={isSaving}
                >
                  <option value="">Create empty role</option>
                  {existingRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <span className="form-hint">
                  Copying will create the same stage/competency structure with empty scores
                </span>
              </div>
            )}
            
            {error && <div className="edit-modal-error">{error}</div>}
          </div>

          <div className="edit-modal-footer">
            <span className="edit-modal-hint">
              The new role will be added to {discipline}
            </span>
            <div className="edit-modal-actions">
              <button type="button" className="edit-modal-btn edit-modal-btn-cancel" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="edit-modal-btn edit-modal-btn-save" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

