"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      setError(err.response?.data?.detail || "An error occurred");
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="state-variables">State Variables</Label>
              <Input id="state-variables" value={variables} onChange={(e) => setVariables(e.target.value)} placeholder="x1, x2, x3" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vector-field-f">Vector Field f(x)</Label>
              <Textarea id="vector-field-f" value={f} onChange={(e) => setF(e.target.value)} placeholder="x2, -sin(x1) - x2" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vector-field-g">Vector Field g(x)</Label>
              <Textarea id="vector-field-g" value={g} onChange={(e) => setG(e.target.value)} placeholder="0, 1" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="output-function-h">Output Function h(x)</Label>
              <Input id="output-function-h" value={h} onChange={(e) => setH(e.target.value)} placeholder="x1" />
            </div>
            
            <Button onClick={handleCompute} className="w-full" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? "Computing..." : "Compute Relative Degree"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent aria-live="polite">
            {error && (
               <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                 {error}
               </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="font-semibold">Relative Degree (r):</span>
                  <span className="text-2xl font-bold">{result.relative_degree !== null ? result.relative_degree : "Undefined"}</span>
                </div>
                
                {result.Lg_Lf_h && (
                  <div className="space-y-2">
                     <Label>L_g L_f^(r-1) h (Decoupling Matrix):</Label>
                     <div className="p-3 bg-secondary rounded-md font-mono text-sm overflow-x-auto">
                       {result.Lg_Lf_h}
                     </div>
                  </div>
                )}
                
                {result.Lie_derivatives && (
                  <div className="space-y-2">
                    <Label>Lie Derivatives (L_f^k h):</Label>
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
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p>Run computation to see results.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
