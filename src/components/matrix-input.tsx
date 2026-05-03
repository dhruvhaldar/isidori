import React, { useRef, useEffect, useCallback, useState } from "react";
import { Copy, Check, Eraser } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MatrixInputProps {
  label: string;
  rows: number;
  cols: number;
  value: number[][];
  onChange?: (value: number[][]) => void;
  readOnly?: boolean;
}

// ⚡ Bolt: Memoize individual cells to prevent O(N*M) re-renders when a single value changes.
const MatrixCell = React.memo(({ r, c, val, readOnly, onChange, label }: { r: number, c: number, val: number, readOnly: boolean, onChange: (r: number, c: number, val: string) => void, label: string }) => (
  <Input
    type="number"
    step="any"
    value={Number.isNaN(val) ? "" : val}
    onChange={(e) => onChange(r, c, e.target.value)}
    onFocus={(e) => e.target.select()}
    readOnly={readOnly}
    className={`text-center h-8 px-1 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${readOnly ? "bg-muted cursor-default" : ""}`}
    aria-label={`${label} row ${r + 1} column ${c + 1}`}
    title={`${label} row ${r + 1} column ${c + 1}`}
  />
));
MatrixCell.displayName = "MatrixCell";

// ⚡ Bolt: Memoize the entire MatrixInput so unrelated matrices don't re-render
// when one matrix is modified on the parent page.
export const MatrixInput = React.memo(function MatrixInput({ label, rows, cols, value, onChange, readOnly = false }: MatrixInputProps) {

  // ⚡ Bolt: Use refs to create a stable handleChange reference,
  // allowing MatrixCell to be effectively memoized.
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  const handleChange = useCallback((r: number, c: number, val: string) => {
    const newValue = valueRef.current.map(row => [...row]);
    newValue[r][c] = parseFloat(val);
    onChangeRef.current?.(newValue);
  }, []);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleClear = useCallback(() => {
    const emptyValue = Array(rows).fill(0).map(() => Array(cols).fill(0));
    onChangeRef.current?.(emptyValue);
  }, [rows, cols]);

  // Ensure value matches rows/cols, if not, parent should fix it or we just render safe
  // We assume value is correct size for now.
  
  return (
    <fieldset className="space-y-2 relative">
      <legend className="w-full flex items-center justify-between mb-2 text-sm font-medium leading-none">
        <span>{label} ({rows}x{cols})</span>
        {readOnly ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleCopy}
            aria-live="polite"
          >
            <span className="sr-only">
              {copied ? `Copied ${label} matrix` : `Copy ${label} matrix to clipboard`}
            </span>
            {copied ? (
              <>
                <Check aria-hidden="true" className="w-3 h-3 mr-1" />
                <span aria-hidden="true">Copied</span>
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="w-3 h-3 mr-1" />
                <span aria-hidden="true">Copy</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={handleClear}
            title={`Clear ${label} matrix`}
          >
            <span className="sr-only">Clear {label} matrix</span>
            <Eraser aria-hidden="true" className="w-3 h-3 mr-1" />
            <span aria-hidden="true">Clear</span>
          </Button>
        )}
      </legend>
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <MatrixCell
              key={`${r}-${c}`}
              r={r}
              c={c}
              val={value[r] && value[r][c] !== undefined ? value[r][c] : 0}
              readOnly={readOnly}
              onChange={handleChange}
              label={label}
            />
          ))
        )}
      </div>
    </fieldset>
  );
});
