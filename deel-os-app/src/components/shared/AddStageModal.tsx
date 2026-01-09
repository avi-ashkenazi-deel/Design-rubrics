import { useState, useEffect } from 'react';
import { createStage } from '../../utils/api';

interface AddStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  discipline: string;
  existingCompetencies: string[];
}

export function AddStageModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  discipline,
  existingCompetencies 
}: AddStageModalProps) {
  const [stageName, setStageName] = useState('');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [newCompetency, setNewCompetency] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStageName('');
      setSelectedCompetencies([]);
      setNewCompetency('');
      setError(null);
    }
  }, [isOpen]);

  const handleToggleCompetency = (comp: string) => {
    setSelectedCompetencies(prev => 
      prev.includes(comp) 
        ? prev.filter(c => c !== comp)
        : [...prev, comp]
    );
  };

  const handleAddNewCompetency = () => {
    if (newCompetency.trim() && !selectedCompetencies.includes(newCompetency.trim())) {
      setSelectedCompetencies(prev => [...prev, newCompetency.trim()]);
      setNewCompetency('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stageName.trim()) {
      setError('Stage name is required');
      return;
    }
    
    if (selectedCompetencies.length === 0) {
      setError('Select at least one competency');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await createStage(discipline, stageName.trim(), selectedCompetencies);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stage');
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
              <span>Add Interview Stage</span>
              <span className="edit-modal-subtitle">{discipline}</span>
            </div>
            <button type="button" className="edit-modal-close" onClick={onClose}>×</button>
          </div>
          
          <div className="edit-modal-body">
            <div className="form-group">
              <label htmlFor="stage-name">Stage Name</label>
              <input
                id="stage-name"
                type="text"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g., Technical Interview, Portfolio Review"
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Competencies to Include</label>
              <div className="competency-checklist">
                {existingCompetencies.map(comp => (
                  <div key={comp} className="checkbox-item" onClick={() => !isSaving && handleToggleCompetency(comp)}>
                    <div className="checkbox-wrapper-44">
                      <label className="toggleButton">
                        <input
                          type="checkbox"
                          checked={selectedCompetencies.includes(comp)}
                          onChange={() => {}}
                          disabled={isSaving}
                        />
                        <div>
                          <svg viewBox="0 0 44 44">
                            <path d="M14,24 L21,31 L39.7428882,11.5937758 C35.2809627,6.53125861 30.0333333,4 24,4 C12.95,4 4,12.95 4,24 C4,35.05 12.95,44 24,44 C35.05,44 44,35.05 44,24 C44,19.3 42.5809627,15.1645919 39.7428882,11.5937758" transform="translate(-2.000000, -2.000000)"></path>
                          </svg>
                        </div>
                      </label>
                    </div>
                    <span className="checkbox-label">{comp}</span>
                  </div>
                ))}
                {selectedCompetencies.filter(c => !existingCompetencies.includes(c)).map(comp => (
                  <div key={comp} className="checkbox-item new-competency" onClick={() => !isSaving && handleToggleCompetency(comp)}>
                    <div className="checkbox-wrapper-44">
                      <label className="toggleButton">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => {}}
                          disabled={isSaving}
                        />
                        <div>
                          <svg viewBox="0 0 44 44">
                            <path d="M14,24 L21,31 L39.7428882,11.5937758 C35.2809627,6.53125861 30.0333333,4 24,4 C12.95,4 4,12.95 4,24 C4,35.05 12.95,44 24,44 C35.05,44 44,35.05 44,24 C44,19.3 42.5809627,15.1645919 39.7428882,11.5937758" transform="translate(-2.000000, -2.000000)"></path>
                          </svg>
                        </div>
                      </label>
                    </div>
                    <span className="checkbox-label">{comp} (new)</span>
                  </div>
                ))}
              </div>
              
              <div className="add-new-inline">
                <input
                  type="text"
                  value={newCompetency}
                  onChange={(e) => setNewCompetency(e.target.value)}
                  placeholder="Add new competency..."
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewCompetency();
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={handleAddNewCompetency}
                  disabled={!newCompetency.trim() || isSaving}
                  className="btn-add-inline"
                >
                  Add
                </button>
              </div>
            </div>
            
            {error && <div className="edit-modal-error">{error}</div>}
          </div>

          <div className="edit-modal-footer">
            <span className="edit-modal-hint">
              {selectedCompetencies.length} competencies selected
            </span>
            <div className="edit-modal-actions">
              <button type="button" className="edit-modal-btn edit-modal-btn-cancel" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="edit-modal-btn edit-modal-btn-save" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Stage'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

