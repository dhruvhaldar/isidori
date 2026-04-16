"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/linear", label: "Linear Systems" },
    { href: "/nonlinear", label: "Nonlinear Systems" },
    { href: "/simulate", label: "Simulation" },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm ${
              isActive ? "font-bold text-foreground" : "text-foreground/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
