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

const TRAFFIC_LIGHTS = [
  { key: 'red' as const, emoji: '🔴', label: 'Needs Improvement', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.05)', border: 'rgba(220, 38, 38, 0.15)', focusBorder: 'rgba(220, 38, 38, 0.4)' },
  { key: 'yellow' as const, emoji: '🟡', label: 'Developing', color: '#EA580C', bg: 'rgba(234, 88, 12, 0.05)', border: 'rgba(234, 88, 12, 0.15)', focusBorder: 'rgba(234, 88, 12, 0.4)' },
  { key: 'green' as const, emoji: '🟢', label: 'Meeting Expectations', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.05)', border: 'rgba(22, 163, 74, 0.15)', focusBorder: 'rgba(22, 163, 74, 0.4)' },
] as const;

function AutoResizeInput({ value, onChange, placeholder, color }: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  color: string;
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
      style={{ '--input-accent': color } as React.CSSProperties}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      rows={1}
      spellCheck={false}
    />
  );
}

export function ExamplesModal({ isOpen, onClose, onSave, initialExamples, focusArea, role, readOnly = false }: ExamplesModalProps) {
  const [examples, setExamples] = useState<TrafficLightExamples>(initialExamples);

  useEffect(() => {
    setExamples({
      ...initialExamples,
      red: initialExamples.red.length > 0 ? initialExamples.red : [''],
      yellow: initialExamples.yellow.length > 0 ? initialExamples.yellow : [''],
      green: initialExamples.green.length > 0 ? initialExamples.green : [''],
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

  type ColorKey = 'red' | 'yellow' | 'green';

  const updateExample = (color: ColorKey, index: number, value: string) => {
    setExamples(prev => ({
      ...prev,
      [color]: prev[color].map((ex: string, i: number) => i === index ? value : ex),
    }));
  };

  const addExample = (color: ColorKey) => {
    if (examples[color].length >= 6) return;
    setExamples(prev => ({
      ...prev,
      [color]: [...prev[color], ''],
    }));
  };

  const removeExample = (color: ColorKey, index: number) => {
    if (examples[color].length <= 1) return;
    setExamples(prev => ({
      ...prev,
      [color]: prev[color].filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSave = () => {
    const cleaned: TrafficLightExamples = {
      expectations: examples.expectations,
      red: examples.red.filter(e => e.trim() !== ''),
      yellow: examples.yellow.filter(e => e.trim() !== ''),
      green: examples.green.filter(e => e.trim() !== ''),
      framing: examples.framing,
    };
    if (cleaned.red.length === 0) cleaned.red = [];
    if (cleaned.yellow.length === 0) cleaned.yellow = [];
    if (cleaned.green.length === 0) cleaned.green = [];
    onSave(cleaned);
    onClose();
  };

  const hasChanges = JSON.stringify(examples) !== JSON.stringify(initialExamples);

  const hasNotes = TRAFFIC_LIGHTS.some(({ key }) =>
    examples[key].some(e => e.trim() !== '')
  );

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

          {/* Expectations — the neutral criteria */}
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

          {/* Traffic light legend */}
          <div className="examples-legend">
            <div className="examples-legend-title">Rate yourself against these expectations</div>
            <div className="examples-legend-items">
              {TRAFFIC_LIGHTS.map(({ emoji, label, color }) => (
                <span key={label} className="examples-legend-item" style={{ color }}>{emoji} {label}</span>
              ))}
            </div>
          </div>

          {/* Editor notes per traffic light level */}
          {(!readOnly || hasNotes) && TRAFFIC_LIGHTS.map(({ key, emoji, label, color, bg, border, focusBorder }) => {
            const items = examples[key].filter(e => readOnly ? e.trim() !== '' : true);
            if (readOnly && items.length === 0) return null;

            return (
              <div
                key={key}
                className="examples-section"
                style={{ '--section-color': color, '--section-bg': bg, '--section-border': border, '--section-focus-border': focusBorder } as React.CSSProperties}
              >
                <div className="examples-section-header">
                  <span className="examples-section-emoji">{emoji}</span>
                  <span className="examples-section-label" style={{ color }}>{label}</span>
                  {!readOnly && <span className="examples-section-hint">Notes</span>}
                </div>

                <div className="examples-list">
                  {items.map((example, idx) => (
                    <div key={idx} className="examples-item">
                      <span className="examples-bullet" style={{ color }}>•</span>
                      {readOnly ? (
                        <span className="examples-readonly-text">{example}</span>
                      ) : (
                        <AutoResizeInput
                          value={example}
                          onChange={(val) => updateExample(key, idx, val)}
                          placeholder={`Add ${label.toLowerCase()} note…`}
                          color={color}
                        />
                      )}
                      {!readOnly && examples[key].length > 1 && (
                        <button
                          className="examples-remove-btn"
                          onClick={() => removeExample(key, idx)}
                          title="Remove"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {!readOnly && examples[key].length < 6 && (
                    <button className="examples-add-btn" onClick={() => addExample(key)} style={{ color }}>
                      + Add note
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
