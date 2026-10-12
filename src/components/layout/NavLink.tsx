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
        "inline-flex min-h-11 items-center px-1 text-sm font-medium transition-colors sm:min-h-9 " +
        (activo ? "text-accent" : "text-muted-foreground hover:text-accent")
      }
    >
      {children}
    </Link>
  );
}
