import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { haptic } from '../utils/haptics';

interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  prefixIcon?: React.ReactNode;
  forceDirection?: 'up' | 'down';
}

export function CustomSelect({ options, value, onChange, placeholder = 'Select an option', className = '', prefixIcon, forceDirection }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [maxHeight, setMaxHeight] = useState(320);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (isOpen && selectRef.current) {
      if (forceDirection) {
        setOpenUpwards(forceDirection === 'up');
        return;
      }
      const rect = selectRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 16; // 16px padding
      const spaceAbove = rect.top - 16;
      
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setOpenUpwards(true);
        setMaxHeight(Math.min(320, spaceAbove));
      } else {
        setOpenUpwards(false);
        setMaxHeight(Math.min(320, spaceBelow));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => { haptic.light(); setIsOpen(!isOpen); }}
        className={`w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 h-14 rounded-xl px-3 sm:px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all flex items-center justify-between text-left`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
          {prefixIcon && <span className="text-slate-400 shrink-0">{prefixIcon}</span>}
          <span className={`truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden overflow-y-auto ${
              openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  haptic.light();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-primary/5 text-primary font-medium' : 'text-slate-700'
                }`}
              >
                {option.label}
                {value === option.value && <Check size={16} className="text-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
