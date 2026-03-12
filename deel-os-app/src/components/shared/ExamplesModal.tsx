import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrafficLightExamples } from '../../data/ladderExampleTemplates';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examples: TrafficLightExamples) => void;
  initialExamples: TrafficLightExamples;
  focusArea: string;
  role: string;
  readOnly?: boolean;
}

function AutoResizeInput({ value, onChange, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <textarea
      ref={ref}
      className="examples-inline-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      rows={1}
      spellCheck={false}
    />
  );
}

// Normalize legacy format (red/yellow/green) into examples
function normalizeExamples(data: TrafficLightExamples): TrafficLightExamples {
  if (data.examples != null && Array.isArray(data.examples)) {
    return data;
  }
  const legacy = data as unknown as { red?: string[]; yellow?: string[]; green?: string[] };
  const merged = [
    ...(legacy.red || []),
    ...(legacy.yellow || []),
    ...(legacy.green || []),
  ].filter(e => e.trim() !== '');
  return {
    expectations: data.expectations || [],
    examples: merged.length > 0 ? merged : [],
    framing: data.framing,
  };
}

export function ExamplesModal({ isOpen, onClose, onSave, initialExamples, focusArea, role, readOnly = false }: ExamplesModalProps) {
  const [examples, setExamples] = useState<TrafficLightExamples>(() => normalizeExamples(initialExamples));

  useEffect(() => {
    const normalized = normalizeExamples(initialExamples);
    setExamples({
      ...normalized,
      examples: normalized.examples.length > 0 ? normalized.examples : [''],
    });
  }, [initialExamples]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const updateExample = (index: number, value: string) => {
    setExamples(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex),
    }));
  };

  const addExample = () => {
    if (examples.examples.length >= 12) return;
    setExamples(prev => ({
      ...prev,
      examples: [...prev.examples, ''],
    }));
  };

  const removeExample = (index: number) => {
    if (examples.examples.length <= 1) return;
    setExamples(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    const cleaned: TrafficLightExamples = {
      expectations: examples.expectations,
      examples: examples.examples.filter(e => e.trim() !== ''),
      framing: examples.framing,
    };
    onSave(cleaned);
    onClose();
  };

  const initialNorm = normalizeExamples(initialExamples);
  const initialCleaned = initialNorm.examples.filter(e => e.trim() !== '');
  const currentCleaned = examples.examples.filter(e => e.trim() !== '');
  const hasChanges =
    JSON.stringify(initialCleaned) !== JSON.stringify(currentCleaned) ||
    JSON.stringify(initialNorm.expectations) !== JSON.stringify(examples.expectations);

  const hasExamples = examples.examples.some(e => e.trim() !== '');

  const items = examples.examples.filter(e => readOnly ? e.trim() !== '' : true);

  return (
    <div className="edit-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="edit-modal examples-modal">
        <div className="edit-modal-header">
          <div className="edit-modal-title">
            <span>{focusArea}</span>
            <span className="edit-modal-subtitle">{role}</span>
          </div>
          <button className="edit-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="examples-modal-body">
          {examples.framing && (
            <div className="examples-framing">
              {examples.framing}
            </div>
          )}

          {examples.expectations && examples.expectations.length > 0 && (
            <div className="examples-expectations">
              <div className="examples-expectations-header">Expectations</div>
              <div className="examples-expectations-list">
                {examples.expectations.map((exp, idx) => (
                  <div key={idx} className="examples-expectation-item">
                    <span className="examples-expectation-number">{idx + 1}</span>
                    <span className="examples-expectation-text">{exp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!readOnly || hasExamples) && (
            <div className="examples-section examples-section-unified">
              <div className="examples-section-header">
                <span className="examples-section-label">Examples</span>
                {!readOnly && <span className="examples-section-hint">Add your own examples below</span>}
              </div>

              <div className="examples-list">
                {items.map((example, idx) => (
                  <div key={idx} className="examples-item">
                    <span className="examples-bullet">•</span>
                    {readOnly ? (
                      <span className="examples-readonly-text">{example}</span>
                    ) : (
                      <AutoResizeInput
                        value={example}
                        onChange={(val) => updateExample(idx, val)}
                        placeholder="Add example…"
                      />
                    )}
                    {!readOnly && examples.examples.length > 1 && (
                      <button
                        className="examples-remove-btn"
                        onClick={() => removeExample(idx)}
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {!readOnly && examples.examples.length < 12 && (
                  <button className="examples-add-btn" onClick={addExample}>
                    + Add example
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="edit-modal-footer">
          <div className="edit-modal-hint">
            <kbd>Esc</kbd> to close
          </div>
          {readOnly ? (
            <button className="edit-modal-btn edit-modal-btn-cancel" onClick={onClose}>Close</button>
          ) : (
            <div className="edit-modal-actions">
              <button className="edit-modal-btn edit-modal-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="edit-modal-btn edit-modal-btn-save" onClick={handleSave} disabled={!hasChanges}>
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
