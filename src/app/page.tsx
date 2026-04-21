import Link from "next/link";
import Image from "next/image";
import { Network, FunctionSquare, LineChart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="mx-auto flex max-w-[980px] flex-col items-start gap-2 pt-8 md:pt-12 pb-8">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
          Geometric Control Theory <br className="hidden sm:inline" />
          Interactive Learning Tool
        </h1>
        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
          Explore linear and nonlinear control concepts based on KTH course SF2842.
          Compute invariant subspaces, check disturbance decoupling, and verify relative degree.
        </p>
        <div className="flex w-full items-center justify-start gap-2 py-2">
          <Button asChild>
            <Link href="/linear">
              Get Started
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="https://github.com/dhruvhaldar/isidori" target="_blank" rel="noopener noreferrer" className="gap-2">
              GitHub
              <ExternalLink aria-hidden="true" className="w-4 h-4" />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/linear" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Linear Systems
              </CardTitle>
              <CardDescription>Geometric concepts for linear systems.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>Invariance and controlled invariance (V*)</li>
                <li>Disturbance decoupling (DDP)</li>
                <li>System inversion</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
        <Link href="/nonlinear" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FunctionSquare className="w-5 h-5 text-primary" />
                Nonlinear Systems
              </CardTitle>
              <CardDescription>Tools for nonlinear analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>Relative degree</li>
                <li>Lie derivatives</li>
                <li>Zero dynamics</li>
                <li>Input-output linearization</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
        <Link href="/simulate" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl md:col-span-2 lg:col-span-1">
          <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Simulation
              </CardTitle>
              <CardDescription>Visualize system behavior.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                <li>Time response simulation</li>
                <li>Disturbance rejection verification</li>
                <li>Tracking performance</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="py-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Disturbance Decoupling Example</h2>
        <Card className="overflow-hidden">
           <div className="aspect-[2/1] relative w-full">
             <Image
               src="/graphs/ddp_demo.png" 
               alt="Disturbance Decoupling Demo" 
               fill
               className="object-contain bg-white"
             />
           </div>
           <CardContent className="pt-4">
             <p className="text-sm text-muted-foreground">
               Simulation showing the effect of DDP control. The red line shows the output without control (affected by disturbance), 
               while the blue line shows the output with geometric control (zero output despite disturbance).
             </p>
           </CardContent>
        </Card>
      </section>
    </div>
  );
}
