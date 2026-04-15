import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Isidori - Geometric Control Theory",
  description: "Educational tool for geometric control theory based on SF2842.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
          Skip to main content
        </a>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex w-full overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Link className="mr-6 flex items-center space-x-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm shrink-0" href="/">
                <span className="font-bold inline-block">Isidori</span>
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link className="transition-colors hover:text-foreground/80 text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" href="/linear">Linear Systems</Link>
                <Link className="transition-colors hover:text-foreground/80 text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" href="/nonlinear">Nonlinear Systems</Link>
                <Link className="transition-colors hover:text-foreground/80 text-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" href="/simulate">Simulation</Link>
              </nav>
            </div>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 container py-6 outline-none">
          {children}
        </main>
        <footer className="mt-8 text-center text-muted-foreground py-4">
          &copy; 2026 <a href="https://dhruvhaldar.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors inline-flex items-center gap-1">Dhruv Haldar <ExternalLink className="w-3 h-3" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>. MIT License. | <a href="https://github.com/dhruvhaldar/isidori" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm transition-colors inline-flex items-center gap-1">GitHub <ExternalLink className="w-3 h-3" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>
        </footer>
      </body>
    </html>
  );
}
