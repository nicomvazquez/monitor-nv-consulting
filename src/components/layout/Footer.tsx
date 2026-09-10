import Link from "next/link";
import { Logo } from "./Logo";

// Fijo a propósito (no `new Date().getFullYear()`): este footer se renderiza
// en el layout raíz, es decir en todas las páginas — calcularlo en cada
// request forzaría a Next a tratar toda la app como dinámica y perder el
// prerenderizado estático que hoy tiene /calculadora-bonos.
const AÑO = 2026;

export function Footer() {
  return (
    <footer className="border-t border-accent/15 bg-background/95">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8 px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Logo className="h-5 w-5" />
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

        <div className="flex flex-col items-center gap-1 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground">
          <p>
            Datos vía{" "}
            <a
              href="https://www.invertironline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              IOL
            </a>
            ,{" "}
            <a href="https://dolarapi.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              dolarapi.com
            </a>
            ,{" "}
            <a
              href="https://www.bcra.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              BCRA
            </a>
            ,{" "}
            <a
              href="https://www.binance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              Binance
            </a>{" "}
            y{" "}
            <a
              href="https://api.argentinadatos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              ArgentinaDatos
            </a>
            .
          </p>
          <p className="text-muted-foreground/60">
            Información con fines de referencia, no constituye asesoramiento financiero.
          </p>
          <p className="text-muted-foreground/60">© {AÑO} Nicolás Vázquez</p>
        </div>
      </div>
    </footer>
  );
}
