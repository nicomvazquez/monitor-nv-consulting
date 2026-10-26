import Link from "next/link";
import type { Session } from "next-auth";
import type { Dolar } from "@/lib/dolarapi/types";
import { DolaresCarousel } from "@/components/dolares/DolaresCarousel";
import { cerrarSesion, iniciarSesionGoogle } from "@/lib/auth/actions";
import { Logo } from "./Logo";
import { MenuLateral } from "./MenuLateral";

/** Reemplaza los links de Noticias/Calculadora de bonos que tenía esta fila antes — esos ahora viven en el menú lateral. */
function SesionNav({ sesion }: { sesion: Session | null }) {
  if (sesion?.user) {
    return (
      <div className="flex items-center gap-2.5">
        {sesion.user.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatar de Google, dominio externo variable: no vale la pena configurar remotePatterns para esto.
          <img src={sesion.user.image} alt="" className="size-7 flex-none rounded-full" />
        ) : (
          <div className="flex size-7 flex-none items-center justify-center rounded-full bg-card text-xs font-semibold text-accent">
            {(sesion.user.name ?? sesion.user.email ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-sm:hidden text-sm font-medium text-foreground">{sesion.user.name ?? sesion.user.email}</span>
        <form action={cerrarSesion}>
          <button
            type="submit"
            className="min-h-11 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent sm:min-h-9"
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
        className="min-h-11 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:min-h-9"
      >
        Iniciar sesión
      </button>
    </form>
  );
}

export function Header({
  dolares,
  error,
  sesion,
}: {
  dolares: Dolar[] | null;
  error: string | null;
  sesion: Session | null;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-accent/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-2.5 px-6 max-sm:px-2 py-3 max-sm:py-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo priority className="h-7 w-auto" />
            {/* No es <h1>: esto vive en el layout raíz, se repite en todas las páginas — el
                título de cada página es el que define esa página, no el nombre del sitio. */}
            <p className="text-base font-semibold tracking-tight text-foreground">
              Monitor<span className="text-accent">.</span>
            </p>
          </Link>

          <div className="flex items-center gap-4">
            <SesionNav sesion={sesion} />
            <MenuLateral sesion={sesion} />
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs text-red-300">
            {error}
          </div>
        ) : dolares && dolares.length > 0 ? (
          <DolaresCarousel dolares={dolares} />
        ) : null}
      </div>
    </header>
  );
}
