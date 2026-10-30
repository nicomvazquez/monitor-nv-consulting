"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VariacionBadge } from "@/components/cotizaciones/VariacionBadge";
import { formatPrice, formatVolumen } from "@/lib/format";
import type { AccionCompleta } from "@/lib/iol/types";

type Panel = "lider" | "general";

const NOMBRE_PANEL: Record<Panel, string> = {
  lider: "Panel Líder",
  general: "Panel General",
};

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

export function TablaAccionesCompleta({ lider, general }: { lider: AccionCompleta[]; general: AccionCompleta[] }) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("lider");
  const datos = panel === "lider" ? lider : general;

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-flex w-fit gap-1 rounded-xl border border-border bg-card/40 p-1">
        {(["lider", "general"] as const).map((opcion) => (
          <button
            key={opcion}
            type="button"
            onClick={() => setPanel(opcion)}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors " +
              (panel === opcion ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground")
            }
          >
            {NOMBRE_PANEL[opcion]}
            <span className="ml-1.5 font-mono text-xs tabular-nums opacity-70">{opcion === "lider" ? lider.length : general.length}</span>
          </button>
        ))}
      </div>

      {datos.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-border/50 px-3 py-8 max-sm:px-2.5 max-sm:py-6">
          <p className="text-sm text-muted-foreground">No hay datos para mostrar.</p>
        </div>
      ) : (
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
                <Th>Moneda</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {datos.map((accion) => (
                <tr
                  key={accion.simbolo}
                  onClick={() => router.push(`/acciones-argentinas/${accion.simbolo}`)}
                  className="cursor-pointer transition-colors hover:bg-accent/5"
                  title="Ver fundamentals"
                >
                  <Td muted={false}>
                    <span className="font-sans font-semibold text-foreground">{accion.simbolo}</span>
                  </Td>
                  <Td muted>
                    <span className="font-sans">{accion.descripcion}</span>
                  </Td>
                  <Td derecha>{formatPrice(accion.ultimoPrecio)}</Td>
                  <Td derecha>
                    <VariacionBadge variacion={accion.variacionPorcentual} />
                  </Td>
                  <Td derecha muted>
                    {accion.apertura ? formatPrice(accion.apertura) : "-"}
                  </Td>
                  <Td derecha muted>
                    {accion.maximo ? formatPrice(accion.maximo) : "-"}
                  </Td>
                  <Td derecha muted>
                    {accion.minimo ? formatPrice(accion.minimo) : "-"}
                  </Td>
                  <Td derecha muted>
                    {formatPrice(accion.ultimoCierre)}
                  </Td>
                  <Td derecha muted>
                    {accion.puntas.precioCompra !== null ? (
                      <>
                        {formatPrice(accion.puntas.precioCompra)}
                        {accion.puntas.cantidadCompra !== null && (
                          <span className="ml-1 text-[0.65rem] opacity-70">×{formatVolumen(accion.puntas.cantidadCompra)}</span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td derecha muted>
                    {accion.puntas.precioVenta !== null ? (
                      <>
                        {formatPrice(accion.puntas.precioVenta)}
                        {accion.puntas.cantidadVenta !== null && (
                          <span className="ml-1 text-[0.65rem] opacity-70">×{formatVolumen(accion.puntas.cantidadVenta)}</span>
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td derecha muted>{accion.volumen ? formatVolumen(accion.volumen) : "-"}</Td>
                  <Td derecha muted>{accion.cantidadOperaciones || "-"}</Td>
                  <Td muted>
                    <span className="font-sans">{accion.moneda}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
