import { CurrencyBtc } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Session } from "next-auth";
import { VariacionBadge } from "@/components/cotizaciones/VariacionBadge";
import type { Dolar } from "@/lib/dolarapi/types";
import { DolaresCarousel } from "@/components/dolares/DolaresCarousel";
import { cerrarSesion, iniciarSesionGoogle } from "@/lib/auth/actions";
import { formatPrice } from "@/lib/format";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import type { FilaCotizacion } from "@/lib/types";
import { Logo } from "./Logo";
import { MenuLateral } from "./MenuLateral";

/** Precio de Bitcoin al lado del logo: el dato de mercado que más se mira de arrancada, visible en todo el sitio (no solo en la home). */
function BtcChip({ btc }: { btc: FilaCotizacion | null }) {
  if (!btc || btc.ultimoPrecio === null) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 py-1 pr-2.5 pl-2 max-sm:hidden">
      <CurrencyBtc size={16} weight="bold" className="flex-none text-accent" aria-hidden="true" />
      <span className="font-mono text-sm font-semibold tabular-nums text-foreground">US${formatPrice(btc.ultimoPrecio)}</span>
      <VariacionBadge variacion={btc.variacionPorcentual} />
    </div>
  );
}

/** Reemplaza los links de Noticias/Calculadora de bonos que tenía esta fila antes — esos ahora viven en el menú lateral. */
function SesionNav({ sesion }: { sesion: Session | null }) {
  if (sesion?.user) {
    return (
      <div className="flex items-center gap-2.5 rounded-full border border-border bg-card/60 py-1 pr-1 pl-2.5">
        {sesion.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar de Google, dominio externo variable: no vale la pena configurar remotePatterns para esto.
          <img src={sesion.user.image} alt="" className="size-7 flex-none rounded-full ring-1 ring-border" />
        ) : (
          <div className="flex size-7 flex-none items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
            {(sesion.user.name ?? sesion.user.email ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-sm:hidden text-sm font-medium text-foreground">{sesion.user.name ?? sesion.user.email}</span>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="min-h-9 rounded-full bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            Salir
          </button>
        </form>
      </div>
    );
  }

  return (
    <form action={iniciarSesionGoogle}>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/60 px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:min-h-9"
      >
        <GoogleIcon className="size-4 flex-none" />
        Iniciar sesión
      </button>
    </form>
  );
}

export function Header({
  dolares,
  error,
  btc,
  sesion,
}: {
  dolares: Dolar[] | null;
  error: string | null;
  btc: FilaCotizacion | null;
  sesion: Session | null;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-2 px-6 max-sm:px-2 py-3 max-sm:py-1.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo priority className="h-7 w-auto" />
              {/* No es <h1>: esto vive en el layout raíz, se repite en todas las páginas — el
                  título de cada página es el que define esa página, no el nombre del sitio. */}
              <p className="text-base font-semibold tracking-tight text-foreground">
                Monitor<span className="text-accent">.</span>
              </p>
            </Link>
            <BtcChip btc={btc} />
          </div>

          <div className="flex items-center gap-3">
            <SesionNav sesion={sesion} />
            <MenuLateral sesion={sesion} />
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs text-red-300">
            {error}
          </div>
        ) : dolares && dolares.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 px-0.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">Cotizaciones en vivo</span>
            </div>
            <DolaresCarousel dolares={dolares} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
