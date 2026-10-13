import type { LecapFila } from "@/lib/googlesheets/types";
import { formatPrice } from "@/lib/format";

const COLUMNAS = [
  "Ticker",
  "Val. nominal",
  "Emisión",
  "Vencimiento",
  "Plazo orig.",
  "Tasa licitada",
  "Valor al vto.",
  "Días al vto.",
  "Precio compra",
  "Rend. período",
  "TIR",
  "TEM",
];

function celda(valor: number | null, sufijo = ""): string {
  return valor !== null ? `${formatPrice(valor)}${sufijo}` : "-";
}

export function LecapsTable({ filas }: { filas: LecapFila[] }) {
  if (filas.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay datos para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="min-w-full divide-y divide-border/60 text-left text-xs sm:text-sm">
        <thead className="bg-card">
          <tr>
            {COLUMNAS.map((titulo, i) => (
              <th
                key={titulo}
                scope="col"
                className={
                  "px-2 py-1 sm:px-3 sm:py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-accent " +
                  (i === 0 ? "max-sm:sticky max-sm:left-0 max-sm:z-10 max-sm:bg-card" : "text-right")
                }
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {filas.map((fila) => (
            <tr key={fila.ticker} className="transition-colors hover:bg-accent/5">
              <td className="px-2 py-1 sm:px-3 sm:py-2 max-sm:sticky max-sm:left-0 max-sm:bg-background font-medium text-foreground">
                {fila.ticker}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {celda(fila.valorNominal)}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {fila.fechaEmision || "-"}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {fila.fechaVencimiento || "-"}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {fila.plazoOriginal ?? "-"}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {celda(fila.tasaLicitada, "%")}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono font-semibold tabular-nums text-accent">
                {celda(fila.valorPagoVencimiento)}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {fila.plazoAlVencimiento ?? "-"}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {celda(fila.precioCompra)}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {celda(fila.rendimientoPeriodo, "%")}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono font-semibold tabular-nums text-accent">
                {celda(fila.tir, "%")}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-2 text-right font-mono tabular-nums text-foreground/90">
                {celda(fila.tasaEfectivaMensual, "%")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
