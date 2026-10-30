import type { FilaCotizacion } from "@/lib/types";
import { VariacionBadge } from "@/components/cotizaciones/VariacionBadge";
import { agruparPorSector } from "./sectores";

export function TablaSectores({ datos }: { datos: FilaCotizacion[] }) {
  const filas = agruparPorSector(datos);

  if (filas.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border/50 px-3 py-8 max-sm:px-2.5 max-sm:py-6">
        <p className="text-sm text-muted-foreground">No hay datos para agrupar por sector.</p>
      </div>
    );
  }

  return (
    <div className="scrollbar-accent overflow-x-auto rounded-lg border border-border/50">
      <table className="min-w-full divide-y divide-border/50 text-left text-xs sm:text-sm">
        <thead className="bg-card">
          <tr>
            <th scope="col" className="px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
              Sector
            </th>
            <th scope="col" className="px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
              Variación
            </th>
            <th scope="col" className="px-2.5 py-1.5 max-sm:hidden text-right text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
              Acciones
            </th>
            <th scope="col" className="px-2.5 py-1.5 max-sm:hidden text-left text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
              Mejor
            </th>
            <th scope="col" className="px-2.5 py-1.5 max-sm:hidden text-left text-[0.7rem] font-semibold uppercase tracking-wide text-accent">
              Peor
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {filas.map((fila) => (
            <tr key={fila.sector} className="transition-colors hover:bg-accent/5">
              <td className="px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 font-medium text-foreground">
                {fila.sector}
                <span className="mt-0.5 block text-[0.65rem] font-normal text-muted-foreground sm:hidden">
                  {fila.cantidadAcciones} {fila.cantidadAcciones === 1 ? "acción" : "acciones"}
                </span>
              </td>
              <td className="px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 text-right">
                <VariacionBadge variacion={fila.variacionPonderada} />
              </td>
              <td className="px-2.5 py-1.5 max-sm:hidden text-right font-mono tabular-nums text-muted-foreground">
                {fila.cantidadAcciones}
              </td>
              <td className="px-2.5 py-1.5 max-sm:hidden">
                {fila.mejor ? (
                  <span className="flex items-center gap-1.5 text-foreground">
                    {fila.mejor.simbolo}
                    <VariacionBadge variacion={fila.mejor.variacionPorcentual} />
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-2.5 py-1.5 max-sm:hidden">
                {fila.peor ? (
                  <span className="flex items-center gap-1.5 text-foreground">
                    {fila.peor.simbolo}
                    <VariacionBadge variacion={fila.peor.variacionPorcentual} />
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
