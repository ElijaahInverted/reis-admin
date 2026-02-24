import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { cs } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarDays } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  className?: string;
  placeholder?: string;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePicker({ value, onChange, min, className = '', placeholder = 'Vyberte datum' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + 'T00:00:00') : undefined;
  const minDate = min ? new Date(min + 'T00:00:00') : undefined;

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    function handleClickOutside(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        pickerRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open, updatePos]);

  return (
    <div className={className}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => { updatePos(); setOpen(!open); }}
        className="input input-bordered w-full flex items-center gap-2 cursor-pointer text-left"
      >
        <CalendarDays size={16} className="text-base-content/50 shrink-0" />
        {selected ? (
          <span>{selected.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        ) : (
          <span className="text-base-content/40">{placeholder}</span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={pickerRef}
          className="fixed z-[9999] react-day-picker"
          style={{ top: pos.top, left: pos.left }}
        >
          <DayPicker
            mode="single"
            locale={cs}
            selected={selected}
            onSelect={(day) => {
              if (day) onChange(toLocalDateString(day));
              setOpen(false);
            }}
            disabled={minDate ? { before: minDate } : undefined}
            defaultMonth={selected || minDate || new Date()}
            className="bg-base-100 border border-base-300 shadow-lg rounded-box p-3"
          />
        </div>,
        document.body
      )}
    </div>
  );
}
