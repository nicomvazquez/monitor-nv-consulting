import Link from "next/link";
import type { Dolar } from "@/lib/dolarapi/types";
import { DolaresCarousel } from "@/components/dolares/DolaresCarousel";
import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

const ENLACES_NAV = [{ href: "/calculadora-bonos", label: "Calculadora de bonos" }];

export function Header({ dolares, error }: { dolares: Dolar[] | null; error: string | null }) {
  return (
    <header className="sticky top-0 z-10 border-b border-accent/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Cotizaciones<span className="text-accent">.</span>
              </h1>
              <p className="text-xs text-muted-foreground">Mercado argentino en vivo</p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {ENLACES_NAV.map((enlace) => (
              <NavLink key={enlace.href} href={enlace.href}>
                {enlace.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : dolares && dolares.length > 0 ? (
          <DolaresCarousel dolares={dolares} />
        ) : null}
      </div>
    </header>
  );
}
