"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Loader2, FunctionSquare, AlertCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatErrorDetail } from "@/lib/error-formatter";

export default function NonlinearSystemsPage() {
  const [variables, setVariables] = useState("x1, x2");
  const [f, setF] = useState("x2, -sin(x1)");
  const [g, setG] = useState("0, 1");
  const [h, setH] = useState("x1");
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const lastComputedParamsRef = useRef<{ variables: string, f: string, g: string, h: string } | null>(null);

  // ⚡ Bolt: Derive stale state during render to bypass a full effect cycle.
  // Eliminates double re-renders on every keystroke when typing expressions.
  // ⚡ Bolt: Use strict referential equality check instead of JSON.stringify to avoid
  // traversing structures on every keystroke, yielding speedup for stale checks.
  const isStale = !!result && !isLoading && lastComputedParamsRef.current !== null &&
                  (variables !== lastComputedParamsRef.current.variables ||
                   f !== lastComputedParamsRef.current.f ||
                   g !== lastComputedParamsRef.current.g ||
                   h !== lastComputedParamsRef.current.h);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCompute = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const varsList = variables.split(",").map(s => s.trim()).filter(s => s);
      const fList = f.split(",").map(s => s.trim()).filter(s => s);
      const gList = g.split(",").map(s => s.trim()).filter(s => s);
      
      const res = await axios.post("/api/nonlinear/reldeg", {
        f: fList,
        g: gList,
        h: h,
        vars: varsList
      });
      
      setResult(res.data);
      lastComputedParamsRef.current = { variables, f, g, h };
    } catch (err: any) {
      setError(formatErrorDetail(err, "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Nonlinear Systems Analysis</h1>
        <p className="text-muted-foreground">
          Compute relative degree and Lie derivatives for affine nonlinear systems.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Definition</CardTitle>
            <CardDescription>
              Enter the vector fields for dx/dt = f(x) + g(x)u, y = h(x).
              <br/>
              Format: Comma separated expressions for vectors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); handleCompute(); }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  const form = e.currentTarget.closest('form');
                  if (form && !form.checkValidity()) {
                    form.reportValidity();
                    return;
                  }
                  handleCompute();
                }
              }}
            >
              <fieldset disabled={isLoading} className="space-y-4 group">
              <div className="space-y-2">
                <Label htmlFor="state-variables">State Variables <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Input id="state-variables" required aria-invalid={!!error} aria-describedby={`state-variables-help ${error ? 'nonlinear-error' : ''}`.trim()} value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="x1, x2, x3" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" autoComplete="off" />
                <p id="state-variables-help" className="text-xs text-muted-foreground">Example: x1, x2, x3</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vector-field-f">Vector Field f(x) <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Textarea id="vector-field-f" required aria-invalid={!!error} aria-describedby={`vector-field-f-help ${error ? 'nonlinear-error' : ''}`.trim()} value={f} onChange={(e) => setF(e.target.value)} placeholder="x2, -sin(x1) - x2" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" autoComplete="off" />
                <p id="vector-field-f-help" className="text-xs text-muted-foreground">Example: x2, -sin(x1) - x2</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vector-field-g">Vector Field g(x) <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Textarea id="vector-field-g" required aria-invalid={!!error} aria-describedby={`vector-field-g-help ${error ? 'nonlinear-error' : ''}`.trim()} value={g} onChange={(e) => setG(e.target.value)} placeholder="0, 1" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" autoComplete="off" />
                <p id="vector-field-g-help" className="text-xs text-muted-foreground">Example: 0, 1</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="output-function-h">Output Function h(x) <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Input id="output-function-h" required aria-invalid={!!error} aria-describedby={`output-function-h-help ${error ? 'nonlinear-error' : ''}`.trim()} value={h} onChange={(e) => setH(e.target.value)} placeholder="x1" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" autoComplete="off" />
                <p id="output-function-h-help" className="text-xs text-muted-foreground">Example: x1</p>
              </div>

              <Button type="submit" className="w-full relative" disabled={isLoading} aria-busy={isLoading} title="Compute Relative Degree (Cmd/Ctrl + Enter)" aria-keyshortcuts="Meta+Enter Control+Enter">
                <div className="flex items-center justify-center">
                  {isLoading && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Computing..." : "Compute Relative Degree"}
                </div>
                {!isLoading && (
                  <kbd aria-hidden="true" className="absolute right-4 hidden md:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>↵
                  </kbd>
                )}
              </Button>
              </fieldset>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div aria-live="polite">
              {error && (
                 <div id="nonlinear-error" className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1" role="alert">
                   <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0" />
                   <span>{error}</span>
                 </div>
              )}
              {!isLoading && result && !error && (
                <span className="sr-only">Computation complete. Relative degree is {result.relative_degree !== null ? result.relative_degree : "Undefined"}.</span>
              )}
            </div>
            
            {result && (
              <div className={`space-y-4 transition-all duration-300 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 ${isLoading ? "opacity-50 pointer-events-none" : isStale ? "opacity-70 grayscale-[0.5]" : ""}`}>
                {isStale && (
                  <div className="flex items-center gap-2 p-3 text-sm text-amber-800 rounded-md bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 motion-safe:animate-in motion-safe:fade-in" role="alert">
                    <AlertTriangle aria-hidden="true" className="w-4 h-4 shrink-0" />
                    <span>Parameters changed. Recompute to update results.</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-semibold">Relative Degree (r):</span>
                  <span className="text-2xl font-bold">{result.relative_degree !== null ? result.relative_degree : "Undefined"}</span>
                </div>
                
                {result.Lg_Lf_h && (
                  <div className="space-y-2">
                     <h3 className="text-sm font-medium leading-none">L_g L_f^(r-1) h (Decoupling Matrix):</h3>
                     <div className="relative group">
                       <div
                         className="p-3 pr-10 bg-secondary rounded-md font-mono text-sm overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                         tabIndex={0}
                         role="group"
                         aria-label="Decoupling Matrix"
                       >
                         {result.Lg_Lf_h}
                       </div>
                       <Button variant="ghost" size="icon" aria-live="polite" className="absolute right-1 top-1 h-6 w-6 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity" onClick={() => handleCopy(result.Lg_Lf_h)} title={copiedText === result.Lg_Lf_h ? "Copied decoupling matrix" : "Copy decoupling matrix"}>
                         <span className="sr-only">{copiedText === result.Lg_Lf_h ? "Copied decoupling matrix" : "Copy decoupling matrix"}</span>
                         {copiedText === result.Lg_Lf_h ? <Check aria-hidden="true" className="h-3 w-3" /> : <Copy aria-hidden="true" className="h-3 w-3" />}
                       </Button>
                     </div>
                  </div>
                )}
                
                {result.Lie_derivatives && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium leading-none">Lie Derivatives (L_f^k h):</h3>
                    <ul className="space-y-1">
                      {result.Lie_derivatives.map((expr: string, i: number) => (
                        <li key={i} className="relative group">
                          <div
                            className="p-2 pr-10 bg-secondary/50 rounded text-sm font-mono overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                            tabIndex={0}
                            role="group"
                            aria-label={`Lie derivative k=${i}`}
                          >
                            <span>k={i}: {expr}</span>
                          </div>
                          <Button variant="ghost" size="icon" aria-live="polite" className="absolute right-1 top-1 h-6 w-6 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity" onClick={() => handleCopy(expr)} title={copiedText === expr ? `Copied Lie derivative k=${i}` : `Copy Lie derivative k=${i}`}>
                            <span className="sr-only">{copiedText === expr ? `Copied Lie derivative k=${i}` : `Copy Lie derivative k=${i}`}</span>
                            {copiedText === expr ? <Check aria-hidden="true" className="h-3 w-3" /> : <Copy aria-hidden="true" className="h-3 w-3" />}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.message && (
                  <p className="text-muted-foreground">{result.message}</p>
                )}
              </div>
            )}
            
            {!result && !error && (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10 gap-2">
                {isLoading ? (
                  <>
                    <Loader2 aria-hidden="true" className="w-8 h-8 text-muted-foreground/50 animate-spin" />
                    <p>Computing...</p>
                  </>
                ) : (
                  <>
                    <FunctionSquare aria-hidden="true" className="w-8 h-8 text-muted-foreground/50" />
                    <p>Run computation to see results.</p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
