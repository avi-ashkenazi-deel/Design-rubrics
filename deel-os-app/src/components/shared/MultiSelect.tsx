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
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

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
          <div key={option.value} className="checkbox-item" onClick={() => onChange(option.value)}>
            <div className="checkbox-wrapper-44">
              <label className="toggleButton">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => {}}
                />
                <div>
                  <svg viewBox="0 0 44 44">
                    <path d="M14,24 L21,31 L39.7428882,11.5937758 C35.2809627,6.53125861 30.0333333,4 24,4 C12.95,4 4,12.95 4,24 C4,35.05 12.95,44 24,44 C35.05,44 44,35.05 44,24 C44,19.3 42.5809627,15.1645919 39.7428882,11.5937758" transform="translate(-2.000000, -2.000000)"></path>
                  </svg>
                </div>
              </label>
            </div>
            <span className="checkbox-label">{option.label}</span>
          </div>
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






