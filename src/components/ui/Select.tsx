import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function Select({ label, value, onChange, options, className }: SelectProps) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      {label && <span className="text-[11px] font-medium uppercase tracking-wide text-foreground-tertiary">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border-strong bg-surface-hover px-3 py-2 pr-8 text-sm text-foreground outline-none transition-colors hover:border-border-faint focus:border-accent-indigo"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary" />
      </div>
    </label>
  );
}
