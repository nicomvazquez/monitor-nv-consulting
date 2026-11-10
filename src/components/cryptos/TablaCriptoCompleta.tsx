"use client";

import { useRouter } from "next/navigation";
import { VariacionBadge } from "@/components/cotizaciones/VariacionBadge";
import { formatPrice, formatVolumen } from "@/lib/format";
import type { CriptoCompleta } from "@/lib/binance/types";

function Th({ children, derecha = false }: { children: React.ReactNode; derecha?: boolean }) {
  return (
    <th
      scope="col"
      className={
        "whitespace-nowrap px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 text-[0.7rem] font-semibold tracking-wide text-accent uppercase " +
        (derecha ? "text-right" : "text-left")
      }
    >
      {children}
    </th>
  );
}

function Td({ children, derecha = false, muted = false }: { children: React.ReactNode; derecha?: boolean; muted?: boolean }) {
  return (
    <td
      className={
        "whitespace-nowrap px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 font-mono tabular-nums " +
        (derecha ? "text-right " : "") +
        (muted ? "text-muted-foreground" : "text-foreground/90")
      }
    >
      {children}
    </td>
  );
}

/** Mismas columnas y estilo que `TablaAccionesCompleta`, sin selector de panel (es una sola lista) ni columna Moneda (siempre USDT). */
export function TablaCriptoCompleta({ datos, rutaBase }: { datos: CriptoCompleta[]; rutaBase: string }) {
  const router = useRouter();

  if (datos.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border/50 px-3 py-8 max-sm:px-2.5 max-sm:py-6">
        <p className="text-sm text-muted-foreground">No hay datos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-accent overflow-x-auto rounded-lg border border-border/50">
      <table className="min-w-full divide-y divide-border/50 text-left text-xs sm:text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            <Th>Símbolo</Th>
            <Th>Descripción</Th>
            <Th derecha>Último</Th>
            <Th derecha>Variación</Th>
            <Th derecha>Apertura</Th>
            <Th derecha>Máximo</Th>
            <Th derecha>Mínimo</Th>
            <Th derecha>Cierre ant.</Th>
            <Th derecha>Compra</Th>
            <Th derecha>Venta</Th>
            <Th derecha>Volumen</Th>
            <Th derecha>Operaciones</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {datos.map((cripto) => (
            <tr
              key={cripto.simbolo}
              onClick={() => router.push(`${rutaBase}/${cripto.simbolo}`)}
              className="cursor-pointer transition-colors hover:bg-accent/5"
              title="Ver fundamentals"
            >
              <Td muted={false}>
                <span className="font-sans font-semibold text-foreground">{cripto.simbolo}</span>
              </Td>
              <Td muted>
                <span className="font-sans">{cripto.descripcion}</span>
              </Td>
              <Td derecha>{cripto.ultimoPrecio !== null ? formatPrice(cripto.ultimoPrecio) : "-"}</Td>
              <Td derecha>
                <VariacionBadge variacion={cripto.variacionPorcentual} />
              </Td>
              <Td derecha muted>
                {cripto.apertura !== null ? formatPrice(cripto.apertura) : "-"}
              </Td>
              <Td derecha muted>
                {cripto.maximo !== null ? formatPrice(cripto.maximo) : "-"}
              </Td>
              <Td derecha muted>
                {cripto.minimo !== null ? formatPrice(cripto.minimo) : "-"}
              </Td>
              <Td derecha muted>
                {cripto.cierreAnterior !== null ? formatPrice(cripto.cierreAnterior) : "-"}
              </Td>
              <Td derecha muted>
                {cripto.puntas?.precioCompra != null ? (
                  <>
                    {formatPrice(cripto.puntas.precioCompra)}
                    {cripto.puntas.cantidadCompra !== null && (
                      <span className="ml-1 text-[0.65rem] opacity-70">×{formatVolumen(cripto.puntas.cantidadCompra)}</span>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </Td>
              <Td derecha muted>
                {cripto.puntas?.precioVenta != null ? (
                  <>
                    {formatPrice(cripto.puntas.precioVenta)}
                    {cripto.puntas.cantidadVenta !== null && (
                      <span className="ml-1 text-[0.65rem] opacity-70">×{formatVolumen(cripto.puntas.cantidadVenta)}</span>
                    )}
                  </>
                ) : (
                  "-"
                )}
              </Td>
              <Td derecha muted>{cripto.volumen !== null ? formatVolumen(cripto.volumen) : "-"}</Td>
              <Td derecha muted>{cripto.cantidadOperaciones ?? "-"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
