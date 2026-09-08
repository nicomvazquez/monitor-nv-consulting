import type { FilaCotizacion } from "@/lib/types";
import { formatPrice } from "@/lib/format";

/**
 * Mismo formato de lista compacta que `MacroSection` (fila con label+detalle
 * a la izquierda, valor en mono a la derecha, sin header de tabla): la
 * caución vive en la misma barra lateral que los indicadores macro, así que
 * conviene que luzca igual en vez de la tabla con columnas de los paneles
 * de acciones/bonos.
 */
export function CaucionList({ items }: { items: FilaCotizacion[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay tasas para mostrar.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <div className="divide-y divide-border/40">
        {items.map((item) => (
          <div key={item.simbolo} className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{item.simbolo}</p>
              <p className="truncate text-[0.7rem] text-muted-foreground/70">{item.descripcion}</p>
            </div>
            <p className="flex-none font-mono text-sm font-semibold tabular-nums text-accent">
              {item.ultimoPrecio !== null ? `${formatPrice(item.ultimoPrecio)}%` : "-"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
