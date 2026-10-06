import type { FilaIndicador } from "@/lib/types";

/** Fila compacta (no tarjeta): mismo formato que `MacroCard`, pero genérica (recibe el valor ya formateado). */
export function IndicadorRow({ indicador }: { indicador: FilaIndicador }) {
  return (
    <div className="flex items-center justify-between gap-3 px-2.5 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{indicador.nombre}</p>
        {indicador.fecha && <p className="text-[0.7rem] text-muted-foreground/60">Al {indicador.fecha}</p>}
      </div>
      <p className="flex-none font-mono text-sm font-semibold tabular-nums text-foreground">{indicador.valor}</p>
    </div>
  );
}
