"use client";

import { List, X } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Session } from "next-auth";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cerrarSesion, iniciarSesionGoogle } from "@/lib/auth/actions";
import { ENLACES_PRINCIPALES, GRUPOS, type Enlace } from "@/lib/nav";

const SUSCRIBIRSE_NOOP = () => () => {};

/** `true` recién en el cliente — evita el mismatch de hidratación de portar a `document.body`, que no existe en el server. */
function useMontado(): boolean {
  return useSyncExternalStore(
    SUSCRIBIRSE_NOOP,
    () => true,
    () => false,
  );
}

function ItemEnlace({ href, label, descripcion, Icono, abierto, onNavegar }: Enlace & { abierto: boolean; onNavegar: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavegar}
      tabIndex={abierto ? 0 : -1}
      className="group flex min-h-14 items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-background"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
        <Icono size={18} weight="bold" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{descripcion}</span>
      </span>
    </Link>
  );
}

/**
 * Menú de navegación que se desliza desde el lado derecho, superpuesto al
 * resto del sitio. No reemplaza la navegación del header (conviven) — eso
 * puede cambiar más adelante. Montado siempre (no solo cuando está abierto)
 * para que la animación de entrada/salida se vea en los dos sentidos.
 */
export function MenuLateral({ sesion }: { sesion: Session | null }) {
  const [abierto, setAbierto] = useState(false);
  const montado = useMontado();

  useEffect(() => {
    if (!abierto) return;

    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", cerrarConEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <>
      {/* size-11 (44px): mínimo recomendado de blanco de toque — a size-9 (36px), pegado al borde derecho de la
          pantalla, varios celulares no llegan a registrar el toque (gesto de borde / alcance del pulgar). */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        aria-expanded={abierto}
        className="-mr-1 inline-flex size-11 flex-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-accent"
      >
        <List size={22} weight="bold" aria-hidden="true" />
      </button>

      {montado &&
        createPortal(
          <div
            className={
              "fixed inset-0 z-[60] transition-opacity duration-200 " +
              (abierto ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
            }
          >
            <button
              type="button"
              aria-label="Cerrar menú"
              tabIndex={abierto ? 0 : -1}
              onClick={() => setAbierto(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación"
              className={
                "absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col border-l border-border " +
                "bg-card px-3 py-3 shadow-2xl shadow-black/60 transition-transform duration-200 " +
                (abierto ? "translate-x-0" : "translate-x-full")
              }
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Navegación</span>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar menú"
                  tabIndex={abierto ? 0 : -1}
                  className="-mr-1 inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-accent"
                >
                  <X size={18} weight="bold" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
                {ENLACES_PRINCIPALES.map((enlace) => (
                  <ItemEnlace key={enlace.href} {...enlace} abierto={abierto} onNavegar={() => setAbierto(false)} />
                ))}

                {GRUPOS.map((grupo) => (
                  <div key={grupo.categoria} className="mt-2">
                    <p className="px-2.5 pt-2 pb-1 text-[0.65rem] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                      {grupo.categoria}
                    </p>
                    {grupo.enlaces.map((enlace) => (
                      <ItemEnlace key={enlace.href} {...enlace} abierto={abierto} onNavegar={() => setAbierto(false)} />
                    ))}
                  </div>
                ))}
              </nav>

              <div className="mt-auto border-t border-border pt-3">
                {sesion?.user ? (
                  <div className="flex items-center gap-2.5 rounded-xl bg-background px-2.5 py-2">
                    {sesion.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- avatar de Google, dominio externo variable: no vale la pena configurar remotePatterns para esto.
                      <img src={sesion.user.image} alt="" className="size-8 flex-none rounded-full" />
                    ) : (
                      <div className="flex size-8 flex-none items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                        {(sesion.user.name ?? sesion.user.email ?? "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{sesion.user.name ?? sesion.user.email}</p>
                    </div>
                    <form action={cerrarSesion}>
                      <button
                        type="submit"
                        tabIndex={abierto ? 0 : -1}
                        className="flex-none rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-accent"
                      >
                        Salir
                      </button>
                    </form>
                  </div>
                ) : (
                  <form action={iniciarSesionGoogle}>
                    <button
                      type="submit"
                      tabIndex={abierto ? 0 : -1}
                      className="min-h-11 w-full rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      Iniciar sesión con Google
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
