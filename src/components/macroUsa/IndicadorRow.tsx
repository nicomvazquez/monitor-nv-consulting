import type { FilaIndicador } from "@/lib/types";

/** Fila de una sola línea: mismo formato que `MacroCard`. */
export function IndicadorRow({ indicador, zebra = false }: { indicador: FilaIndicador; zebra?: boolean }) {
  return (
    <div
      title={indicador.nombre}
      className={"flex items-center justify-between gap-3 px-2.5 py-2.5 transition-colors hover:bg-accent/10 " + (zebra ? "bg-white/[0.025]" : "")}
    >
      <p className="min-w-0 truncate text-xs text-muted-foreground">
        {indicador.nombre}
        {indicador.fecha && <span className="text-muted-foreground/50"> · {indicador.fecha}</span>}
      </p>
      <p className="flex-none font-mono text-sm font-semibold tabular-nums text-foreground">{indicador.valor}</p>
    </div>
  );
}
