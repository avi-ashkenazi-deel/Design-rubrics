import { useState, useEffect } from 'react';
import { createDiscipline } from '../../utils/api';

interface AddDisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingDisciplines: string[];
}

export function AddDisciplineModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  existingDisciplines 
}: AddDisciplineModalProps) {
  const [disciplineName, setDisciplineName] = useState('');
  const [initialRoles, setInitialRoles] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDisciplineName('');
      setInitialRoles('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!disciplineName.trim()) {
      setError('Discipline name is required');
      return;
    }

    if (existingDisciplines.some(d => d.toLowerCase() === disciplineName.trim().toLowerCase())) {
      setError('A discipline with this name already exists');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const roles = initialRoles.trim()
        ? initialRoles.split(',').map(r => r.trim()).filter(r => r)
        : undefined;
      
      await createDiscipline(disciplineName.trim(), roles);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create discipline');
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
              <span>Add Discipline</span>
            </div>
            <button type="button" className="edit-modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="edit-modal-body">
            <div className="form-group">
              <label htmlFor="discipline-name">Discipline Name</label>
              <input
                id="discipline-name"
                type="text"
                value={disciplineName}
                onChange={(e) => setDisciplineName(e.target.value)}
                placeholder="e.g., Product Management, Sales"
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="initial-roles">Initial Roles (Optional)</label>
              <input
                id="initial-roles"
                type="text"
                value={initialRoles}
                onChange={(e) => setInitialRoles(e.target.value)}
                placeholder="e.g., Junior, Senior, Lead (comma-separated)"
                disabled={isSaving}
              />
              <span className="form-hint">
                Enter role names separated by commas. You can add more roles later.
              </span>
            </div>
            
            {error && <div className="edit-modal-error">{error}</div>}
          </div>

          <div className="edit-modal-footer">
            <span className="edit-modal-hint">
              Create a new hiring discipline
            </span>
            <div className="edit-modal-actions">
              <button type="button" className="edit-modal-btn edit-modal-btn-cancel" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="edit-modal-btn edit-modal-btn-save" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Discipline'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

