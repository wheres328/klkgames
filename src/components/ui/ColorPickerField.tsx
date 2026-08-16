"use client";

import { useId } from "react";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const PRESETS = [
  "#7c3aed",
  "#a78bfa",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#f7f7f7",
  "#111111",
];

function toColorInputValue(value: string): string {
  return /^#([0-9a-fA-F]{6})$/.test(value) ? value.toLowerCase() : "#000000";
}

export function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 rounded-input border border-border bg-surface p-2">
        <input
          id={id}
          type="color"
          value={toColorInputValue(value)}
          onChange={(event) => onChange(event.target.value)}
          className="size-9 cursor-pointer rounded-input border border-border bg-transparent p-0.5"
          title="Abrir selector de color"
        />
        <span className="font-mono text-xs text-muted">{toColorInputValue(value)}</span>
        <span className="flex flex-wrap gap-1">
          {PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              aria-label={`Usar color ${color}`}
              onClick={() => onChange(color)}
              className="size-5 rounded-full border border-border transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
