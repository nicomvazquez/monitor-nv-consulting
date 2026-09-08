import type { FilaCotizacion } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { VariacionBadge } from "./VariacionBadge";

interface CotizacionesTableProps {
  items: FilaCotizacion[];
  /** Poner en `false` para ocultar la columna Variación (ej. caución, donde no aplica). */
  mostrarVariacion?: boolean;
  /** Título de la columna de precio: "Último" con mercado abierto, "Cierre" con mercado cerrado. */
  columnaPrecio?: string;
}

export function CotizacionesTable({
  items,
  mostrarVariacion = true,
  columnaPrecio = "Último",
}: CotizacionesTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-[28rem] items-center justify-center rounded-lg border border-border/60">
        <p className="text-sm text-muted-foreground">No hay cotizaciones para mostrar.</p>
      </div>
    );
  }

  return (
    // Alto fijo (no máximo): así todos los paneles del grid quedan parejos
    // entre sí sin importar cuántas filas tenga cada uno.
    <div className="scrollbar-accent h-[28rem] overflow-y-auto overflow-x-auto rounded-lg border border-border/60">
      <table className="min-w-full divide-y divide-border/60 text-left text-xs sm:text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            <th
              scope="col"
              className="px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
            >
              Símbolo
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
            >
              {columnaPrecio}
            </th>
            {mostrarVariacion && (
              <th
                scope="col"
                className="px-3 py-2 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
              >
                Variación
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {items.map((item) => (
            <tr key={item.simbolo} className="transition-colors hover:bg-accent/5">
              <td className="px-3 py-2 font-medium text-foreground">{item.simbolo}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
              </td>
              {mostrarVariacion && (
                <td className="px-3 py-2 text-right">
                  <VariacionBadge variacion={item.variacionPorcentual} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
