"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const activo = pathname === href;

  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={
        "text-sm font-medium transition-colors " + (activo ? "text-accent" : "text-muted-foreground hover:text-accent")
      }
    >
      {children}
    </Link>
  );
}
