import Link from "next/link";
import { ENLACES_PRINCIPALES, GRUPOS } from "@/lib/nav";
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
  { nombre: "Docta Capital", href: "https://docs.docta.com.ar" },
  { nombre: "Google Sheets", href: "https://workspace.google.com/products/sheets/" },
  { nombre: "Google Noticias", href: "https://news.google.com" },
];

function TituloColumna({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{children}</h2>;
}

function EnlaceFooter({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-accent">
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-accent/15 bg-background/95">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8 max-sm:gap-5 px-6 max-sm:px-3 py-10 max-sm:py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-[1.3fr_0.8fr_1fr_0.9fr]">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex w-fit items-center gap-2">
              <Logo className="h-5 w-auto" />
              <span className="text-sm font-semibold text-foreground">
                Monitor<span className="text-accent">.</span>
              </span>
            </Link>
            <p className="max-w-56 text-sm text-muted-foreground">
              Dashboard de mercados y finanzas de Argentina, en vivo.
            </p>
            <p className="text-xs text-muted-foreground/70">Hecho por Nicolás Vázquez</p>
          </div>

          <div className="flex flex-col gap-2">
            <TituloColumna>Secciones</TituloColumna>
            {ENLACES_PRINCIPALES.map((enlace) => (
              <EnlaceFooter key={enlace.href} href={enlace.href} label={enlace.label} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <TituloColumna>Mercados</TituloColumna>
            {GRUPOS.map((grupo) => (
              <div key={grupo.categoria} className="flex flex-col gap-1.5">
                <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                  {grupo.categoria}
                </h3>
                {grupo.enlaces.map((enlace) => (
                  <EnlaceFooter key={enlace.href} href={enlace.href} label={enlace.label} />
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <TituloColumna>Contacto</TituloColumna>
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

        <div className="flex flex-col gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[0.7rem] text-muted-foreground/70">
            <span className="mr-1.5 tracking-wide uppercase">Fuentes</span>
            {FUENTES.map((fuente, indice) => (
              <span key={fuente.href} className="flex items-center gap-1">
                <a href={fuente.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  {fuente.nombre}
                </a>
                {indice < FUENTES.length - 1 && <span className="text-muted-foreground/30">·</span>}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <p className="text-xs text-muted-foreground/60">
              Información con fines de referencia, no constituye asesoramiento financiero. © {AÑO} Nicolás Vázquez
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <Link href="/privacidad" className="hover:text-accent">
                Privacidad
              </Link>
              <span className="text-muted-foreground/30">·</span>
              <Link href="/terminos" className="hover:text-accent">
                Términos de uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
