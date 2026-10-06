import Link from "next/link";
import { Logo } from "./Logo";

// Fijo a propósito (no `new Date().getFullYear()`): este footer se renderiza
// en el layout raíz, es decir en todas las páginas — calcularlo en cada
// request forzaría a Next a tratar toda la app como dinámica y perder el
// prerenderizado estático que hoy tiene /calculadora-bonos.
const AÑO = 2026;

const FUENTES = [
  { nombre: "IOL", href: "https://www.invertironline.com" },
  { nombre: "dolarapi.com", href: "https://dolarapi.com" },
  { nombre: "BCRA", href: "https://www.bcra.gob.ar" },
  { nombre: "ArgentinaDatos", href: "https://api.argentinadatos.com" },
  { nombre: "Binance", href: "https://www.binance.com" },
  { nombre: "Yahoo Finance", href: "https://finance.yahoo.com" },
  { nombre: "FRED", href: "https://fred.stlouisfed.org" },
  { nombre: "Google Sheets", href: "https://workspace.google.com/products/sheets/" },
];

export function Footer() {
  return (
    <footer className="border-t border-accent/15 bg-background/95">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8 px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Logo className="h-5 w-auto" />
              <span className="text-sm font-semibold text-foreground">
                Cotizaciones<span className="text-accent">.</span>
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">Nicolás Vázquez</p>
            <p className="text-xs text-muted-foreground">Desarrollo de herramientas financieras</p>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Navegación</h2>
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-accent">
              Inicio
            </Link>
            <Link
              href="/calculadora-bonos"
              className="text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              Calculadora de bonos
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Contacto</h2>
            <a
              href="mailto:vazquezpizzinicolas@gmail.com"
              className="text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              vazquezpizzinicolas@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/nicolasvazquezpizzi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-border/40 pt-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground/70">
            <span className="uppercase tracking-wide">Fuentes</span>
            {FUENTES.map((fuente) => (
              <a
                key={fuente.href}
                href={fuente.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                {fuente.nombre}
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/60">
            Información con fines de referencia, no constituye asesoramiento financiero. © {AÑO} Nicolás Vázquez
          </p>
        </div>
      </div>
    </footer>
  );
}
