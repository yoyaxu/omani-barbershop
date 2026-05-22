"use client";

import { CalendarDays } from "lucide-react";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

export function DatePickerField({
  value,
  onChange,
  min,
  placeholder = "Seleccionar fecha",
  className = "",
  id,
  required,
}: DatePickerFieldProps) {
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("es-DO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Calendar icon on the left */}
      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none z-10" />

      {/* Native date input styled to match the theme */}
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-secondary border border-border rounded-md pl-10 pr-3 py-2 text-sm text-foreground cursor-pointer hover:border-primary/50 transition-colors appearance-none date-picker-styled"
        placeholder={placeholder}
      />

      {/* Overlay label when no date selected */}
      {!value && (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-sm">
          {placeholder}
        </div>
      )}

      {/* Formatted date display overlay - hides the raw date format */}
      {value && (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-foreground text-sm">
          {formatDisplayDate(value)}
        </div>
      )}
    </div>
  );
}
