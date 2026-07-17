"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Network, FunctionSquare, LineChart } from "lucide-react";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/linear", label: "Linear Systems", icon: Network },
    { href: "/nonlinear", label: "Nonlinear Systems", icon: FunctionSquare },
    { href: "/simulate", label: "Simulation", icon: LineChart },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex items-center gap-2 transition-colors hover:text-foreground/80 focus-visible:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-3 py-2 ${
              isActive ? "font-bold text-accent-foreground bg-accent" : "text-foreground/60 hover:bg-accent/50 focus-visible:bg-accent/50"
            }`}
          >
            <Icon aria-hidden="true" className="w-4 h-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}
