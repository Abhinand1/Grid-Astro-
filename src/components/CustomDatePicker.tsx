import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { haptic } from '../utils/haptics';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
  maxDate?: Date | null;
}

export function CustomDatePicker({ value, onChange, className = '', maxDate }: CustomDatePickerProps) {
  const selectedDate = value ? new Date(value) : null;

  const handleChange = (date: Date | null) => {
    haptic.light();
    if (date) {
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <DatePicker
        selected={selectedDate}
        onChange={handleChange}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        className="w-full bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-slate-800 h-12 sm:h-14 rounded-2xl sm:rounded-xl px-4 pl-11 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer text-sm font-medium"
        wrapperClassName="w-full"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        maxDate={maxDate !== undefined ? (maxDate === null ? undefined : maxDate) : new Date()}
        withPortal
      />
      <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      
      <style>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          background-color: white;
          width: 100%;
          max-width: 320px;
        }
        .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding-top: 1rem;
          padding-bottom: 0.5rem;
        }
        .react-datepicker__current-month {
          color: #0f172a;
          font-weight: 800;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        .react-datepicker__day-name {
          color: #94a3b8;
          font-weight: 700;
          width: 2.25rem;
          line-height: 2.25rem;
          margin: 0.05rem;
          font-size: 0.75rem;
        }
        .react-datepicker__day {
          color: #334155;
          width: 2.25rem;
          line-height: 2.25rem;
          margin: 0.05rem;
          border-radius: 0.75rem;
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .react-datepicker__day:hover {
          background-color: #f1f5f9;
          color: #f97316;
        }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
          background-color: #f97316 !important;
          color: white !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }
        .react-datepicker__day--outside-month {
          color: #cbd5e1;
        }
        .react-datepicker__navigation {
          top: 1.25rem;
        }
        .react-datepicker__year-read-view {
          color: #334155;
          font-weight: 600;
        }
        .react-datepicker__year-dropdown {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__year-option:hover {
          background-color: #f8fafc;
        }
        .react-datepicker__year-option--selected {
          color: #f97316;
          font-weight: 700;
        }
        .react-datepicker__triangle {
          display: none;
        }
      `}</style>
    </div>
  );
}
