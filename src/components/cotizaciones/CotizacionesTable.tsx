import type { FilaCotizacion } from "@/lib/types";
import { formatPrice, formatVolumen } from "@/lib/format";
import { TituloTabla } from "@/components/ui/TituloTabla";
import { VariacionBadge } from "./VariacionBadge";

interface CotizacionesTableProps {
  titulo: string;
  items: FilaCotizacion[];
  /** Poner en `false` para ocultar la columna Variación (ej. caución, donde no aplica). */
  mostrarVariacion?: boolean;
  /** Poner en `true` para sumar la columna Volumen (solo paneles cuya fuente lo tiene). */
  mostrarVolumen?: boolean;
  /** Título de la columna de precio: "Último" con mercado abierto, "Cierre" con mercado cerrado. */
  columnaPrecio?: string;
}

/**
 * En mobile (`max-sm`) los paneles van de a dos columnas, así que las columnas
 * Variación y Volumen no entran: su dato se muestra debajo del precio y del
 * símbolo, respectivamente. Desde `sm` la tabla es la de siempre.
 *
 * Rediseño "menos tenso": antes cada fila tenía una línea divisoria propia
 * (`divide-y`) sobre filas muy bajas (py-1) con un header en el color de
 * acento — mucha línea y poco aire, leía como una grilla de Excel. Ahora el
 * límite entre filas lo da el cebrado (zebra striping) y el padding, no una
 * línea por fila; el header pasa a `muted-foreground` (el acento se guarda
 * para lo que de verdad hay que destacar) y las filas tienen más alto.
 */
export function CotizacionesTable({
  titulo,
  items,
  mostrarVariacion = true,
  mostrarVolumen = false,
  columnaPrecio = "Último",
}: CotizacionesTableProps) {
  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/30">
        <TituloTabla titulo={titulo} />
        <div className="flex items-center justify-center px-4 py-10 max-sm:px-3 max-sm:py-6">
          <p className="text-sm text-muted-foreground">No hay cotizaciones para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/30">
      <TituloTabla titulo={titulo} />
      {/* Alto máximo (no fijo): un panel con pocas filas mide lo que necesita, no
          los mismos 28rem que uno con 30 — el resto del layout (columnas CSS en
          app/page.tsx) es el que aprovecha ese espacio liberado. */}
      <div className="scrollbar-accent max-h-[29rem] overflow-y-auto overflow-x-auto">
        <table className="min-w-full text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border/70">
              <th
                scope="col"
                className="px-3.5 py-2.5 max-sm:px-2 max-sm:py-1.5 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Símbolo
              </th>
              <th
                scope="col"
                className="px-3.5 py-2.5 max-sm:px-2 max-sm:py-1.5 text-right text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase"
              >
                {columnaPrecio}
              </th>
              {mostrarVariacion && (
                <th
                  scope="col"
                  className="px-3.5 py-2.5 max-sm:hidden text-right text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  Variación
                </th>
              )}
              {mostrarVolumen && (
                <th
                  scope="col"
                  className="px-3.5 py-2.5 max-sm:hidden text-right text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  Vol.
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.simbolo}
                className={"transition-colors hover:bg-accent/10 " + (i % 2 === 1 ? "bg-white/[0.025]" : "")}
              >
                <td className="px-3.5 py-2.5 max-sm:px-2 max-sm:py-1.5 font-medium text-foreground">
                  {item.simbolo}
                  {mostrarVolumen && item.volumen ? (
                    <span className="mt-0.5 block font-mono text-[0.65rem] font-normal tabular-nums text-muted-foreground/70 sm:hidden">
                      Vol. {formatVolumen(item.volumen)}
                    </span>
                  ) : null}
                </td>
                <td className="px-3.5 py-2.5 max-sm:px-2 max-sm:py-1.5 text-right font-mono tabular-nums text-foreground/90">
                  {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
                  {mostrarVariacion && item.variacionPorcentual !== null ? (
                    <span className="mt-1 block sm:hidden">
                      <VariacionBadge variacion={item.variacionPorcentual} />
                    </span>
                  ) : null}
                </td>
                {mostrarVariacion && (
                  <td className="px-3.5 py-2.5 max-sm:hidden text-right">
                    <VariacionBadge variacion={item.variacionPorcentual} />
                  </td>
                )}
                {mostrarVolumen && (
                  <td className="px-3.5 py-2.5 max-sm:hidden text-right font-mono tabular-nums text-muted-foreground">
                    {item.volumen ? formatVolumen(item.volumen) : "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
