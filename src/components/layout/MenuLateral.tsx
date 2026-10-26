"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cerrarSesion, iniciarSesionGoogle } from "@/lib/auth/actions";

const SUSCRIBIRSE_NOOP = () => () => {};

/** `true` recién en el cliente — evita el mismatch de hidratación de portar a `document.body`, que no existe en el server. */
function useMontado(): boolean {
  return useSyncExternalStore(
    SUSCRIBIRSE_NOOP,
    () => true,
    () => false,
  );
}

/**
 * Por ahora, los mismos links que ya tiene el header (ver `Header.tsx`) más
 * "Inicio" (que en el header vive en el logo, no como link de texto) — este
 * menú es el punto de partida para sumar más cosas después.
 */
const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/noticias", label: "Noticias" },
  { href: "/calculadora-bonos", label: "Calculadora de bonos" },
];

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
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        aria-expanded={abierto}
        className="inline-flex size-9 flex-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-accent"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
          <path
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 10.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75ZM2.75 9.25a.75.75 0 0 0 0 1.5h14.5a.75.75 0 0 0 0-1.5H2.75Z"
            clipRule="evenodd"
          />
        </svg>
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
                "absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col border-l border-accent/15 " +
                "bg-background px-5 py-4 shadow-xl transition-transform duration-200 " +
                (abierto ? "translate-x-0" : "translate-x-full")
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Menú</span>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  aria-label="Cerrar menú"
                  tabIndex={abierto ? 0 : -1}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-accent"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {ENLACES.map((enlace) => (
                  <Link
                    key={enlace.href}
                    href={enlace.href}
                    onClick={() => setAbierto(false)}
                    tabIndex={abierto ? 0 : -1}
                    className="min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card hover:text-accent"
                  >
                    {enlace.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-border/60 pt-3">
                {sesion?.user ? (
                  <div className="flex items-center gap-2.5 px-1">
                    {sesion.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- avatar de Google, dominio externo variable: no vale la pena configurar remotePatterns para esto.
                      <img src={sesion.user.image} alt="" className="size-8 flex-none rounded-full" />
                    ) : (
                      <div className="flex size-8 flex-none items-center justify-center rounded-full bg-card text-xs font-semibold text-accent">
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
