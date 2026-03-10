import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrafficLightExamples } from '../../data/ladderExampleTemplates';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (examples: TrafficLightExamples) => void;
  initialExamples: TrafficLightExamples;
  focusArea: string;
  role: string;
}

const TRAFFIC_LIGHTS = [
  { key: 'red' as const, emoji: '🔴', label: 'Needs Improvement', color: '#ff5c5c', bg: 'rgba(255, 92, 92, 0.05)', border: 'rgba(255, 92, 92, 0.15)', focusBorder: 'rgba(255, 92, 92, 0.4)' },
  { key: 'yellow' as const, emoji: '🟡', label: 'Developing', color: '#ff9f43', bg: 'rgba(255, 159, 67, 0.05)', border: 'rgba(255, 159, 67, 0.15)', focusBorder: 'rgba(255, 159, 67, 0.4)' },
  { key: 'green' as const, emoji: '🟢', label: 'Strong', color: '#50fa7b', bg: 'rgba(80, 250, 123, 0.05)', border: 'rgba(80, 250, 123, 0.15)', focusBorder: 'rgba(80, 250, 123, 0.4)' },
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

export function ExamplesModal({ isOpen, onClose, onSave, initialExamples, focusArea, role }: ExamplesModalProps) {
  const [examples, setExamples] = useState<TrafficLightExamples>(initialExamples);

  useEffect(() => {
    setExamples(initialExamples);
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
      red: examples.red.filter(e => e.trim() !== ''),
      yellow: examples.yellow.filter(e => e.trim() !== ''),
      green: examples.green.filter(e => e.trim() !== ''),
      framing: examples.framing,
    };
    if (cleaned.red.length === 0) cleaned.red = [''];
    if (cleaned.yellow.length === 0) cleaned.yellow = [''];
    if (cleaned.green.length === 0) cleaned.green = [''];
    onSave(cleaned);
    onClose();
  };

  const hasChanges = JSON.stringify(examples) !== JSON.stringify(initialExamples);

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
          {TRAFFIC_LIGHTS.map(({ key, emoji, label, color, bg, border, focusBorder }) => (
            <div
              key={key}
              className="examples-section"
              style={{ '--section-color': color, '--section-bg': bg, '--section-border': border, '--section-focus-border': focusBorder } as React.CSSProperties}
            >
              <div className="examples-section-header">
                <span className="examples-section-emoji">{emoji}</span>
                <span className="examples-section-label" style={{ color }}>{label}</span>
              </div>

              <div className="examples-list">
                {examples[key].map((example, idx) => (
                  <div key={idx} className="examples-item">
                    <span className="examples-bullet" style={{ color }}>•</span>
                    <AutoResizeInput
                      value={example}
                      onChange={(val) => updateExample(key, idx, val)}
                      placeholder={`Add ${label.toLowerCase()} example…`}
                      color={color}
                    />
                    {examples[key].length > 1 && (
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
                {examples[key].length < 6 && (
                  <button className="examples-add-btn" onClick={() => addExample(key)} style={{ color }}>
                    + Add example
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="edit-modal-footer">
          <div className="edit-modal-hint">
            <kbd>Esc</kbd> to close
          </div>
          <div className="edit-modal-actions">
            <button className="edit-modal-btn edit-modal-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="edit-modal-btn edit-modal-btn-save" onClick={handleSave} disabled={!hasChanges}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
