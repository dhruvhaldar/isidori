"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, CheckCircle, XCircle, Layers, Settings2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MatrixInput } from "@/components/matrix-input";
import { formatErrorDetail } from "@/lib/error-formatter";

function createMatrix(rows: number, cols: number) {
  return Array(rows).fill(0).map(() => Array(cols).fill(0));
}

export default function LinearSystemsPage() {
  const [n, setN] = useState<number | "">(2);
  const [m, setM] = useState<number | "">(1);
  const [p, setP] = useState<number | "">(1);
  const [q, setQ] = useState<number | "">(1); // Disturbance dim

  const [A, setA] = useState(createMatrix(Number(n) || 1, Number(n) || 1));
  const [B, setB] = useState(createMatrix(Number(n) || 1, Number(m) || 1));
  const [C, setC] = useState(createMatrix(Number(p) || 1, Number(n) || 1));
  const [E, setE] = useState(createMatrix(Number(n) || 1, Number(q) || 1));

  const [vStar, setVStar] = useState<number[][] | null>(null);
  const [vStarError, setVStarError] = useState<string | null>(null);
  const [ddpResult, setDdpResult] = useState<{ is_solvable: boolean, V_star: number[][], F?: number[][] } | null>(null);
  const [ddpError, setDdpError] = useState<string | null>(null);
  const [isComputingVStar, setIsComputingVStar] = useState(false);
  const [isCheckingDDP, setIsCheckingDDP] = useState(false);

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

  const handleComputeVStar = async () => {
    setIsComputingVStar(true);
    setVStarError(null);
    try {
      const res = await axios.post("/api/vstar", { A, B, C });
      setVStar(res.data.V_star);
    } catch (err) {
      console.error(err);
      setVStarError(formatErrorDetail(err, "Error computing V*"));
    } finally {
      setIsComputingVStar(false);
    }
  };

  const handleCheckDDP = async () => {
    setIsCheckingDDP(true);
    setDdpError(null);
    try {
      const res = await axios.post("/api/ddp", { A, B, C, E });
      setDdpResult(res.data);
    } catch (err) {
      console.error(err);
      setDdpError(formatErrorDetail(err, "Error checking DDP"));
    } finally {
      setIsCheckingDDP(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Linear Systems Analysis</h1>
        <p className="text-muted-foreground">
          Analyze geometric properties of linear systems: invariance, DDP, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Dimensions</CardTitle>
          <CardDescription>Define the size of your system matrices.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="states-n">States (n)</Label>
              <Input id="states-n" type="number" min="1" value={n} onFocus={(e) => e.target.select()} onChange={(e) => setN(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inputs-m">Inputs (m)</Label>
              <Input id="inputs-m" type="number" min="1" value={m} onFocus={(e) => e.target.select()} onChange={(e) => setM(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outputs-p">Outputs (p)</Label>
              <Input id="outputs-p" type="number" min="1" value={p} onFocus={(e) => e.target.select()} onChange={(e) => setP(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disturbances-q">Disturbances (q)</Label>
              <Input id="disturbances-q" type="number" min="1" value={q} onFocus={(e) => e.target.select()} onChange={(e) => setQ(e.target.value === "" ? "" : parseInt(e.target.value) || 1)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Matrices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <MatrixInput label="A (System Matrix)" rows={Number(n) || 1} cols={Number(n) || 1} value={A} onChange={setA} />
            <MatrixInput label="B (Input Matrix)" rows={Number(n) || 1} cols={Number(m) || 1} value={B} onChange={setB} />
            <MatrixInput label="C (Output Matrix)" rows={Number(p) || 1} cols={Number(n) || 1} value={C} onChange={setC} />
            <MatrixInput label="E (Disturbance Matrix)" rows={Number(n) || 1} cols={Number(q) || 1} value={E} onChange={setE} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controlled Invariance (V*)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" aria-live="polite">
              <Button onClick={handleComputeVStar} className="w-full" disabled={isComputingVStar} aria-busy={isComputingVStar}>
                {isComputingVStar && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                {isComputingVStar ? "Computing V*..." : "Compute V*"}
              </Button>
              {vStarError && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-800 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1" role="alert">
                  <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0" />
                  <span>{vStarError}</span>
                </div>
              )}
              {vStar && (
                <div className="mt-4 space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                  <MatrixInput
                    label="V* Basis Matrix"
                    rows={vStar.length}
                    cols={vStar[0]?.length || 0}
                    value={vStar}
                    readOnly
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Columns represent basis vectors for V*. If empty, V* is trivial or zero.
                  </p>
                </div>
              )}
              {!vStar && !vStarError && !isComputingVStar && (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground mt-4 bg-muted/10 gap-2">
                  <Layers aria-hidden="true" className="w-8 h-8 text-muted-foreground/50" />
                  <p>Compute V* to view basis matrix.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disturbance Decoupling (DDP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" aria-live="polite">
              <Button onClick={handleCheckDDP} variant="secondary" className="w-full" disabled={isCheckingDDP} aria-busy={isCheckingDDP}>
                {isCheckingDDP && <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                {isCheckingDDP ? "Checking DDP..." : "Check DDP Solvability"}
              </Button>
              {ddpError && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-800 rounded-md bg-red-50 dark:bg-red-900/20 dark:text-red-400 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1" role="alert">
                  <AlertCircle aria-hidden="true" className="w-4 h-4 shrink-0" />
                  <span>{ddpError}</span>
                </div>
              )}
              {ddpResult && (
                <div className="mt-4 space-y-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                  <div className={`flex items-center justify-center gap-2 p-2 rounded-md font-bold text-center ${ddpResult.is_solvable ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
                    {ddpResult.is_solvable ? <CheckCircle aria-hidden="true" className="w-5 h-5" /> : <XCircle aria-hidden="true" className="w-5 h-5" />}
                    {ddpResult.is_solvable ? "Solvable" : "Not Solvable"}
                  </div>
                  {ddpResult.is_solvable && ddpResult.F && (
                    <div>
                      <MatrixInput
                        label="Feedback Matrix F"
                        rows={ddpResult.F.length}
                        cols={ddpResult.F[0]?.length || 0}
                        value={ddpResult.F}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              )}
              {!ddpResult && !ddpError && !isCheckingDDP && (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg text-muted-foreground mt-4 bg-muted/10 gap-2">
                  <Settings2 aria-hidden="true" className="w-8 h-8 text-muted-foreground/50" />
                  <p>Check DDP to see solvability.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
