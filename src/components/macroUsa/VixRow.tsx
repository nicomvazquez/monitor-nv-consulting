import type { FilaIndicador } from "@/lib/types";

/** Fila destacada, una sola línea: encabeza la lista, mismo tratamiento que `RiesgoPaisCard` en el panel argentino. */
export function VixRow({ vix }: { vix: FilaIndicador }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-accent/10 px-2.5 py-2.5">
      <p className="min-w-0 truncate text-xs font-semibold tracking-wide text-accent uppercase">{vix.nombre}</p>
      <p className="flex-none font-mono text-base font-bold tabular-nums text-accent">{vix.valor}</p>
    </div>
  );
}
