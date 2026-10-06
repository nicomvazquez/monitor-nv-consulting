import type { FilaIndicador } from "@/lib/types";

/** Fila destacada (fondo/borde acento): encabeza la lista, mismo tratamiento que `RiesgoPaisCard` en el panel argentino. */
export function VixRow({ vix }: { vix: FilaIndicador }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-accent/30 bg-accent/10 px-2.5 py-2">
      <p className="text-xs font-semibold tracking-wide text-accent uppercase">{vix.nombre}</p>
      <p className="flex-none font-mono text-lg font-bold tabular-nums text-accent">{vix.valor}</p>
    </div>
  );
}
