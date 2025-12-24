import { useState, useEffect, useRef } from 'react';

interface EditCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
  initialValue: string;
  title?: string;
  subtitle?: string;
}

export function EditCellModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValue,
  title = 'Edit Cell',
  subtitle
}: EditCellModalProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError(null);
      // Focus textarea after modal opens
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, initialValue]);

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

  const handleSave = async () => {
    if (value === initialValue) {
      onClose();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(value);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Cmd/Ctrl + Enter to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isOpen) return null;

  const hasChanges = value !== initialValue;

  return (
    <div 
      className="edit-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="edit-modal">
        <div className="edit-modal-header">
          <div className="edit-modal-title">
            <span>{title}</span>
            {subtitle && <span className="edit-modal-subtitle">{subtitle}</span>}
          </div>
          <button 
            className="edit-modal-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="edit-modal-body">
          <textarea
            ref={textareaRef}
            className="edit-modal-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter content..."
            disabled={isSaving}
          />
          
          {error && (
            <div className="edit-modal-error">
              {error}
            </div>
          )}
        </div>

        <div className="edit-modal-footer">
          <span className="edit-modal-hint">
            Press <kbd>⌘</kbd>+<kbd>Enter</kbd> to save
          </span>
          <div className="edit-modal-actions">
            <button 
              className="edit-modal-btn edit-modal-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="edit-modal-btn edit-modal-btn-save"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

