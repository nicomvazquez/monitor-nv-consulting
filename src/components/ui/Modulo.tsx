import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/**
 * Bloque de construcción de la nueva filosofía de la app: en vez de muchas
 * tarjetas sueltas flotando en la página, el contenido relacionado vive
 * agrupado dentro de un mismo módulo (un único borde, un único header). Las
 * subsecciones de adentro (ver `ModuloSeccion`) no vuelven a dibujar su
 * propio borde — comparten el del módulo y se separan con una línea fina,
 * para que no se vea "tarjeta dentro de tarjeta".
 */
export function Modulo({
  titulo,
  descripcion,
  Icono,
  acciones,
  children,
  className = "",
  contentClassName = "p-2.5 sm:p-5",
}: {
  titulo: string;
  descripcion?: string;
  Icono?: Icon;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/40 ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-2.5 py-2 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2.5">
          {Icono && (
            <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Icono size={17} weight="bold" aria-hidden="true" />
            </span>
          )}
          <div>
            <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
            {descripcion && <p className="text-xs text-muted-foreground">{descripcion}</p>}
          </div>
        </div>
        {acciones}
      </header>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

/**
 * Subsección dentro de un `Modulo`: título chico + contenido, sin borde ni
 * fondo propio — en una grilla, la separación entre subsecciones la da el
 * `gap` del contenedor, no un borde por ítem (evitar bordes a mitad de fila
 * en el primer renglón de una grilla responsive es más lío que separar con
 * espacio en blanco, y se ve igual de prolijo).
 */
export function ModuloSeccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold text-foreground sm:mb-2">{titulo}</h3>
      {children}
    </div>
  );
}
