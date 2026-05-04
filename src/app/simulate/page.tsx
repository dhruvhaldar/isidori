"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, CheckCircle, AlertTriangle, LineChart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatrixInput } from "@/components/matrix-input";
import { formatErrorDetail } from "@/lib/error-formatter";
// Need to import chart component dynamically to avoid SSR issues with recharts?
// Recharts usually works fine with Next.js App Router if "use client" is present.
import dynamic from 'next/dynamic';

const SystemChart = dynamic(() => import('@/components/system-chart').then(mod => mod.SystemChart), { ssr: false });

function createMatrix(rows: number, cols: number) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

export default function SimulatePage() {
  const [n, setN] = useState<number | "">(2);
  const [m, setM] = useState<number | "">(1);
  const [p, setP] = useState<number | "">(1);
  const [q, setQ] = useState<number | "">(1);

  // Default values for the example DDP system
  // A=[[0, 1], [2, 0]], B=[[0], [1]], C=[[1, -1]], E=[[1], [1]]
  const [A, setA] = useState([[0, 1], [2, 0]]);
  const [B, setB] = useState([[0], [1]]);
  const [C, setC] = useState([[1, -1]]);
  const [E, setE] = useState([[1], [1]]);

  const [simData, setSimData] = useState<any[]>([]);
  const [ddpStatus, setDdpStatus] = useState<boolean | null>(null);
  const [simError, setSimError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Only resize if dimensions change significantly, but here we just handle manual input.
    // Actually, matrix input handles resizing if needed.
    // But we initialized with specific values, so we should update n, m, p, q to match?
    // Or just let user change them.
    // If user changes n, we resize.
  }, []);

  // Update matrices when dimensions change
  useEffect(() => {
     setA(old => resizeMatrix(old, Number(n) || 1, Number(n) || 1));
     setB(old => resizeMatrix(old, Number(n) || 1, Number(m) || 1));
     setC(old => resizeMatrix(old, Number(p) || 1, Number(n) || 1));
     setE(old => resizeMatrix(old, Number(n) || 1, Number(q) || 1));
  }, [n, m, p, q]);

  const resizeMatrix = (mat: number[][], rows: number, cols: number) => {
    const newMat = createMatrix(rows, cols);
    for (let r = 0; r < Math.min(rows, mat.length); r++) {
      for (let c = 0; c < Math.min(cols, mat[0].length); c++) {
        newMat[r][c] = mat[r][c];
      }
    }
    return newMat;
  };

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsSimulating(true);
    setSimError(null);
    try {
      const res = await axios.post("/api/simulate", { A, B, C, E });
      const { time, y, d, is_ddp_solved } = res.data;
      
      const formattedData = time.map((t: number, i: number) => ({
        time: parseFloat(t.toFixed(2)),
        y: y[i][0] !== undefined ? y[i][0] : y[i], // Handle array or scalar
        d: d[i]
      }));
      
      setSimData(formattedData);
      setDdpStatus(is_ddp_solved);
    } catch (err) {
      console.error(err);
      setSimError(formatErrorDetail(err, "Error during simulation"));
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">System Simulation</h1>
        <p className="text-muted-foreground">
          Simulate the time response of the system under disturbance.
          The system will attempt to reject the disturbance using DDP control if solvable.
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
           <CardHeader>
             <CardTitle>System Configuration</CardTitle>
           </CardHeader>
           <CardContent>
             <form className="space-y-4" onSubmit={handleSimulate}>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1"><Label htmlFor="states-n">States (n)</Label><Input id="states-n" type="number" min="1" value={n} onFocus={(e) => e.target.select()} onChange={e => setN(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} /></div>
                  <div className="space-y-1"><Label htmlFor="inputs-m">Inputs (m)</Label><Input id="inputs-m" type="number" min="1" value={m} onFocus={(e) => e.target.select()} onChange={e => setM(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} /></div>
                  <div className="space-y-1"><Label htmlFor="outputs-p">Outputs (p)</Label><Input id="outputs-p" type="number" min="1" value={p} onFocus={(e) => e.target.select()} onChange={e => setP(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} /></div>
                  <div className="space-y-1"><Label htmlFor="disturbances-q">Disturbances (q)</Label><Input id="disturbances-q" type="number" min="1" value={q} onFocus={(e) => e.target.select()} onChange={e => setQ(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} /></div>
               </div>

               <MatrixInput label="A" rows={Number(n) || 1} cols={Number(n) || 1} value={A} onChange={setA} />
               <MatrixInput label="B" rows={Number(n) || 1} cols={Number(m) || 1} value={B} onChange={setB} />
               <MatrixInput label="C" rows={Number(p) || 1} cols={Number(n) || 1} value={C} onChange={setC} />
               <MatrixInput label="E (Disturbance)" rows={Number(n) || 1} cols={Number(q) || 1} value={E} onChange={setE} />

               <div aria-live="polite" className="space-y-4">
                 <Button type="submit" className="w-full" disabled={isSimulating} aria-busy={isSimulating}>
                   {isSimulating && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                   {isSimulating ? "Simulating..." : "Simulate Response"}
                 </Button>
                 {simError && (
                   <div className="flex items-center gap-2 p-3 text-sm text-red-800 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1" role="alert">
                     <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0" />
                     <span>{simError}</span>
                   </div>
                 )}
               </div>
             </form>
           </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Response Plot</CardTitle>
              <CardDescription>
                Output y(t) vs Disturbance d(t) (Sine wave)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {simData.length > 0 ? (
                <div className="space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                   <SystemChart data={simData} />
                   <div className={`flex items-center justify-center gap-2 p-2 rounded text-center text-sm font-semibold ${ddpStatus ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"}`}>
                     {ddpStatus ? <CheckCircle aria-hidden="true" className="w-4 h-4" /> : <AlertTriangle aria-hidden="true" className="w-4 h-4" />}
                     {ddpStatus ? "DDP Solved & Applied" : "DDP Not Solvable (Open Loop / Best Effort)"}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     If DDP is solvable, the output should remain close to zero despite the disturbance.
                   </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/10 gap-2">
                  <LineChart aria-hidden="true" className="w-8 h-8 text-muted-foreground/50" />
                  <p>Run simulation to view plot</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
