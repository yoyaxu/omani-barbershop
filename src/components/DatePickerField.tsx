"use client";

import { useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
      {/* Hidden native date input */}
      <input
        ref={inputRef}
        id={id}
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        tabIndex={-1}
      />

      {/* Custom styled button that looks like an input */}
      <div
        onClick={() => inputRef.current?.showPicker?.()}
        className="w-full flex items-center justify-between bg-secondary border border-border rounded-md px-3 py-2 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <span
          className={`text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <CalendarDays className="w-4 h-4 text-primary shrink-0 ml-2" />
      </div>
    </div>
  );
}
