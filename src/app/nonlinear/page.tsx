"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, FunctionSquare, AlertCircle } from "lucide-react";
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

  const handleCompute = async () => {
    setError(null);
    setResult(null);
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
              Enter the vector fields f(x), g(x) and scalar function h(x).
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
                  handleCompute();
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="state-variables">State Variables <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Input id="state-variables" required value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="x1, x2, x3" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vector-field-f">Vector Field f(x) <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Textarea id="vector-field-f" required value={f} onChange={(e) => setF(e.target.value)} placeholder="x2, -sin(x1) - x2" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vector-field-g">Vector Field g(x) <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Textarea id="vector-field-g" required value={g} onChange={(e) => setG(e.target.value)} placeholder="0, 1" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="output-function-h">Output Function h(x) <span className="text-red-500" aria-hidden="true">*</span><span className="sr-only">(required)</span></Label>
                <Input id="output-function-h" required value={h} onChange={(e) => setH(e.target.value)} placeholder="x1" className="font-mono" spellCheck={false} autoCapitalize="none" autoCorrect="off" />
              </div>

              <Button type="submit" className="w-full relative" disabled={isLoading} aria-busy={isLoading}>
                <div className="flex items-center justify-center">
                  {isLoading && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Computing..." : "Compute Relative Degree"}
                </div>
                {!isLoading && (
                  <kbd className="absolute right-4 hidden md:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>↵
                  </kbd>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent aria-live="polite">
            {error && (
               <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1" role="alert">
                 <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0" />
                 <span>{error}</span>
               </div>
            )}
            
            {result && (
              <div className="space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-semibold">Relative Degree (r):</span>
                  <span className="text-2xl font-bold">{result.relative_degree !== null ? result.relative_degree : "Undefined"}</span>
                </div>
                
                {result.Lg_Lf_h && (
                  <div className="space-y-2">
                     <h3 className="text-sm font-medium leading-none">L_g L_f^(r-1) h (Decoupling Matrix):</h3>
                     <div className="p-3 bg-secondary rounded-md font-mono text-sm overflow-x-auto">
                       {result.Lg_Lf_h}
                     </div>
                  </div>
                )}
                
                {result.Lie_derivatives && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium leading-none">Lie Derivatives (L_f^k h):</h3>
                    <ul className="space-y-1">
                      {result.Lie_derivatives.map((expr: string, i: number) => (
                        <li key={i} className="p-2 bg-secondary/50 rounded text-sm font-mono overflow-x-auto">
                          k={i}: {expr}
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
                <FunctionSquare aria-hidden="true" className="w-8 h-8 text-muted-foreground/50" />
                <p>Run computation to see results.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
