import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 hidden md:flex">
              <Link className="mr-6 flex items-center space-x-2" href="/">
                <span className="hidden font-bold sm:inline-block">Isidori</span>
              </Link>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/linear">Linear Systems</Link>
                <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/nonlinear">Nonlinear Systems</Link>
                <Link className="transition-colors hover:text-foreground/80 text-foreground/60" href="/simulate">Simulation</Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          {children}
        </main>
        <footer style={{ marginTop: "2rem", textAlign: "center", color: "var(--dark-text-color)", padding: "1rem 0" }}>
          &copy; 2026 <a href="https://dhruvhaldar.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: "#272e3f", fontWeight: "bold", textDecoration: "none" }}>Dhruv Haldar</a>. MIT License. | <a href="https://github.com/dhruvhaldar/isidori" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository (opens in a new tab)" style={{ color: "#272e3f", fontWeight: "bold", textDecoration: "none" }}>GitHub</a>
        </footer>
      </body>
    </html>
  );
}
