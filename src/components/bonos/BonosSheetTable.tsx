import { Fragment } from "react";
import type { BonoFila } from "@/lib/googlesheets/types";
import { formatPrice } from "@/lib/format";

const COLUMNAS = [
  "Ticker",
  "Precio USD",
  "TIR",
  "Próx. pago",
  "Días",
  "Valor pago",
  "Duration",
  "Dur. mod.",
  "Convexidad",
];

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function celda(valor: number | null, sufijo = ""): string {
  return valor !== null ? `${formatPrice(valor)}${sufijo}` : "-";
}

export function BonosSheetTable({ filas }: { filas: BonoFila[] }) {
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
                  "px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-accent " +
                  (i === 0 ? "" : "text-right")
                }
              >
                {titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {filas.map((fila, index) => {
            const esNuevaSeccion = index === 0 || filas[index - 1].seccion !== fila.seccion;
            return (
              <Fragment key={fila.ticker}>
                {esNuevaSeccion && fila.seccion && (
                  <tr className="bg-card">
                    <td
                      colSpan={COLUMNAS.length}
                      className="px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-accent"
                    >
                      {capitalizar(fila.seccion)}
                    </td>
                  </tr>
                )}
                <tr className="transition-colors hover:bg-accent/5">
                  <td className="px-3 py-2 font-medium text-foreground">{fila.ticker}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {celda(fila.precioUsd)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {celda(fila.tir, "%")}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {fila.proximoPago || "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {fila.diasAlProximoPago ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {celda(fila.valorPago)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {celda(fila.duration)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {celda(fila.durationModificada)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground/90">
                    {celda(fila.convexidad)}
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
