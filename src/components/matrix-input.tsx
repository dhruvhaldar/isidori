import React from "react";
import { Input } from "@/components/ui/input";

interface MatrixInputProps {
  label: string;
  rows: number;
  cols: number;
  value: number[][];
  onChange: (value: number[][]) => void;
  readOnly?: boolean;
}

export function MatrixInput({ label, rows, cols, value, onChange, readOnly = false }: MatrixInputProps) {
  const handleChange = (r: number, c: number, val: string) => {
    const newValue = value.map(row => [...row]);
    newValue[r][c] = parseFloat(val);
    onChange(newValue);
  };

  // Ensure value matches rows/cols, if not, parent should fix it or we just render safe
  // We assume value is correct size for now.
  
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium leading-none mb-2">{label} ({rows}x{cols})</legend>
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <Input
              key={`${r}-${c}`}
              type="number"
              step="any"
              value={value[r] && value[r][c] !== undefined ? value[r][c] : 0}
              onChange={(e) => handleChange(r, c, e.target.value)}
              readOnly={readOnly}
              className={`text-center h-8 px-1 ${readOnly ? "bg-muted cursor-default" : ""}`}
              aria-label={`${label} row ${r + 1} column ${c + 1}`}
              title={`${label} row ${r + 1} column ${c + 1}`}
            />
          ))
        )}
      </div>
    </fieldset>
  );
}
