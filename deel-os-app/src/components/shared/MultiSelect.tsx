import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  getLabel?: (selected: string[]) => string;
  addAction?: {
    label: string;
    onClick: () => void;
  };
}

export function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder = 'Select...', 
  getLabel,
  addAction
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLabel = getLabel 
    ? getLabel(selected) 
    : selected.length === 0 
      ? placeholder 
      : selected.join(', ');

  const handleAddClick = () => {
    if (addAction) {
      addAction.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className={`multi-select ${isOpen ? 'open' : ''}`} ref={ref}>
      <div className="multi-select-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="multi-select-label">{displayLabel}</span>
        <span className="multi-select-arrow">▾</span>
      </div>
      <div className="multi-select-dropdown">
        {options.map(option => (
          <label key={option.value} className="checkbox-item">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onChange(option.value)}
            />
            <span className="checkbox-label">{option.label}</span>
          </label>
        ))}
        {addAction && (
          <>
            <div className="multi-select-divider" />
            <div className="multi-select-add-option" onClick={handleAddClick}>
              {addAction.label}
            </div>
          </>
        )}
      </div>
    </div>
  );
}






