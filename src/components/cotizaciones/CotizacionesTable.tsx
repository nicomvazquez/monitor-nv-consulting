import type { FilaCotizacion } from "@/lib/types";
import { formatPrice, formatVolumen } from "@/lib/format";
import { VariacionBadge } from "./VariacionBadge";

interface CotizacionesTableProps {
  items: FilaCotizacion[];
  /** Poner en `false` para ocultar la columna Variación (ej. caución, donde no aplica). */
  mostrarVariacion?: boolean;
  /** Poner en `true` para sumar la columna Volumen (solo paneles cuya fuente lo tiene). */
  mostrarVolumen?: boolean;
  /** Título de la columna de precio: "Último" con mercado abierto, "Cierre" con mercado cerrado. */
  columnaPrecio?: string;
}

export function CotizacionesTable({
  items,
  mostrarVariacion = true,
  mostrarVolumen = false,
  columnaPrecio = "Último",
}: CotizacionesTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border/60 px-4 py-10">
        <p className="text-sm text-muted-foreground">No hay cotizaciones para mostrar.</p>
      </div>
    );
  }

  return (
    // Alto máximo (no fijo): un panel con pocas filas mide lo que necesita, no
    // los mismos 28rem que uno con 30 — el resto del layout (columnas CSS en
    // app/page.tsx) es el que aprovecha ese espacio liberado.
    <div className="scrollbar-accent max-h-[28rem] overflow-y-auto overflow-x-auto rounded-lg border border-border/60">
      <table className="min-w-full divide-y divide-border/60 text-left text-xs sm:text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            <th
              scope="col"
              className="px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
            >
              Símbolo
            </th>
            <th
              scope="col"
              className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
            >
              {columnaPrecio}
            </th>
            {mostrarVariacion && (
              <th
                scope="col"
                className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
              >
                Variación
              </th>
            )}
            {mostrarVolumen && (
              <th
                scope="col"
                className="px-2.5 py-1.5 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
              >
                Vol.
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {items.map((item) => (
            <tr key={item.simbolo} className="transition-colors hover:bg-accent/5">
              <td className="px-2.5 py-1 font-medium text-foreground">{item.simbolo}</td>
              <td className="px-2.5 py-1 text-right font-mono tabular-nums text-foreground/90">
                {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
              </td>
              {mostrarVariacion && (
                <td className="px-2.5 py-1 text-right">
                  <VariacionBadge variacion={item.variacionPorcentual} />
                </td>
              )}
              {mostrarVolumen && (
                <td className="px-2.5 py-1 text-right font-mono tabular-nums text-muted-foreground">
                  {item.volumen ? formatVolumen(item.volumen) : "-"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
