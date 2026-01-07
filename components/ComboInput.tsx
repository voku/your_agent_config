import React, { useState, useRef, useEffect } from 'react';

interface ComboInputProps {
  value: string;
  onChange: (value: string) => void;
  presets: string[];
  placeholder?: string;
  name?: string;
}

export const ComboInput: React.FC<ComboInputProps> = ({ value, onChange, presets, placeholder, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredPresets, setFilteredPresets] = useState(presets);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Filter presets based on input
    const filtered = presets.filter(preset => 
      preset.toLowerCase().includes(newValue.toLowerCase())
    );
    setFilteredPresets(filtered);
    setIsOpen(filtered.length > 0);
  };

  const handlePresetSelect = (preset: string) => {
    setInputValue(preset);
    onChange(preset);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setFilteredPresets(presets);
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        name={name}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full bg-surfaceHighlight border border-border rounded-lg px-3 py-2.5 text-sm text-textMain focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder-textMuted/50"
      />
      
      {isOpen && filteredPresets.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredPresets.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className="w-full text-left px-3 py-2 text-sm text-textMain hover:bg-surfaceHighlight transition-colors border-b border-border last:border-b-0"
            >
              {preset}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
