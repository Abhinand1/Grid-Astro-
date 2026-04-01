import React from 'react';
import { CustomSelect } from './CustomSelect';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
  className?: string;
}

export function CustomTimePicker({ value, onChange, className = '' }: CustomTimePickerProps) {
  const [hours, minutes] = value ? value.split(':') : ['', ''];

  const handleHourChange = (h: string | number) => {
    const newHour = String(h).padStart(2, '0');
    onChange(`${newHour}:${minutes || '00'}`);
  };

  const handleMinuteChange = (m: string | number) => {
    const newMinute = String(m).padStart(2, '0');
    onChange(`${hours || '00'}:${newMinute}`);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: String(i).padStart(2, '0')
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: String(i).padStart(2, '0'),
    label: String(i).padStart(2, '0')
  }));

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div className="flex-1">
        <CustomSelect
          value={hours}
          onChange={handleHourChange}
          options={hourOptions}
          placeholder="HH"
          prefixIcon={<Clock size={16} />}
        />
      </div>
      <span className="font-bold text-slate-400">:</span>
      <div className="flex-1">
        <CustomSelect
          value={minutes}
          onChange={handleMinuteChange}
          options={minuteOptions}
          placeholder="MM"
        />
      </div>
    </div>
  );
}
