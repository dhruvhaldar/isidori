"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatrixInput } from "@/components/matrix-input";
// Need to import chart component dynamically to avoid SSR issues with recharts?
// Recharts usually works fine with Next.js App Router if "use client" is present.
import dynamic from 'next/dynamic';

const SystemChart = dynamic(() => import('@/components/system-chart').then(mod => mod.SystemChart), { ssr: false });

function createMatrix(rows: number, cols: number) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

export default function SimulatePage() {
  const [n, setN] = useState(2);
  const [m, setM] = useState(1);
  const [p, setP] = useState(1);
  const [q, setQ] = useState(1);

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
     setA(old => resizeMatrix(old, n, n));
     setB(old => resizeMatrix(old, n, m));
     setC(old => resizeMatrix(old, p, n));
     setE(old => resizeMatrix(old, n, q));
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

  const handleSimulate = async () => {
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
      setSimError("Error during simulation");
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
             <form onSubmit={(e) => { e.preventDefault(); handleSimulate(); }} className="space-y-4">
               <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1"><Label htmlFor="states-n">States (n)</Label><Input id="states-n" type="number" min="1" value={n} onChange={e => setN(parseInt(e.target.value)||1)} /></div>
                  <div className="space-y-1"><Label htmlFor="inputs-m">Inputs (m)</Label><Input id="inputs-m" type="number" min="1" value={m} onChange={e => setM(parseInt(e.target.value)||1)} /></div>
                  <div className="space-y-1"><Label htmlFor="outputs-p">Outputs (p)</Label><Input id="outputs-p" type="number" min="1" value={p} onChange={e => setP(parseInt(e.target.value)||1)} /></div>
                  <div className="space-y-1"><Label htmlFor="disturbances-q">Disturbances (q)</Label><Input id="disturbances-q" type="number" min="1" value={q} onChange={e => setQ(parseInt(e.target.value)||1)} /></div>
               </div>

               <MatrixInput label="A" rows={n} cols={n} value={A} onChange={setA} />
               <MatrixInput label="B" rows={n} cols={m} value={B} onChange={setB} />
               <MatrixInput label="C" rows={p} cols={n} value={C} onChange={setC} />
               <MatrixInput label="E (Disturbance)" rows={n} cols={q} value={E} onChange={setE} />

               <div aria-live="polite" className="space-y-4">
                 <Button type="submit" className="w-full" disabled={isSimulating} aria-busy={isSimulating}>
                   {isSimulating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   {isSimulating ? "Simulating..." : "Simulate Response"}
                 </Button>
                 {simError && (
                   <div className="p-3 text-sm text-red-800 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400" role="alert">
                     {simError}
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
                <div className="space-y-4">
                   <SystemChart data={simData} />
                   <div className={`p-2 rounded text-center text-sm font-semibold ${ddpStatus ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                     {ddpStatus ? "DDP Solved & Applied" : "DDP Not Solvable (Open Loop / Best Effort)"}
                   </div>
                   <p className="text-xs text-muted-foreground">
                     If DDP is solvable, the output should remain close to zero despite the disturbance.
                   </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
                  Run simulation to view plot
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
