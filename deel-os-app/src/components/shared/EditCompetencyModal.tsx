import { useState, useEffect, useRef } from 'react';
import { createCompetencyDefinition, updateCompetencyDefinition } from '../../utils/api';

interface EditCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  competency: {
    id?: number;
    name: string;
    focusArea: string;
    description: string;
    isNew: boolean;
  } | null;
  discipline: string;
}

export function EditCompetencyModal({ 
  isOpen, 
  onClose, 
  onSave, 
  competency,
  discipline
}: EditCompetencyModalProps) {
  const [name, setName] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && competency) {
      setName(competency.name);
      setFocusArea(competency.focusArea);
      setDescription(competency.description);
      setError(null);
      // Focus name input for new competencies
      if (competency.isNew) {
        setTimeout(() => nameInputRef.current?.focus(), 100);
      }
    }
  }, [isOpen, competency]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Competency name is required');
      return;
    }
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (competency?.isNew) {
        await createCompetencyDefinition(discipline, name.trim(), focusArea.trim(), description.trim());
      } else if (competency?.id) {
        await updateCompetencyDefinition(competency.id, name.trim(), focusArea.trim(), description.trim());
      }
      await onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save competency');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !competency) return null;

  return (
    <div 
      className="edit-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="edit-modal competency-modal">
        <form onSubmit={handleSubmit}>
          <div className="edit-modal-header">
            <div className="edit-modal-title">
              <span>{competency.isNew ? 'Add Competency' : 'Edit Competency'}</span>
              <span className="edit-modal-subtitle">{discipline}</span>
            </div>
            <button 
              type="button"
              className="edit-modal-close" 
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          <div className="edit-modal-body">
            <div className="form-group">
              <label htmlFor="comp-name">Competency Name</label>
              <input
                ref={nameInputRef}
                id="comp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Communication"
                disabled={isSaving || !competency.isNew}
                className={!competency.isNew ? 'readonly-input' : ''}
              />
              {!competency.isNew && (
                <span className="form-hint">Name cannot be changed after creation</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="comp-focus-area">Focus Area (optional)</label>
              <input
                id="comp-focus-area"
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g., Functional Skills"
                disabled={isSaving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="comp-description">Description</label>
              <textarea
                id="comp-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this competency means and how it contributes to success..."
                disabled={isSaving}
                rows={6}
              />
            </div>
            
            {error && (
              <div className="edit-modal-error">
                {error}
              </div>
            )}
          </div>

          <div className="edit-modal-footer">
            <span className="edit-modal-hint">
              {competency.isNew ? 'Create a new competency definition' : 'Update the competency details'}
            </span>
            <div className="edit-modal-actions">
              <button 
                type="button"
                className="edit-modal-btn edit-modal-btn-cancel"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="edit-modal-btn edit-modal-btn-save"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : competency.isNew ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

