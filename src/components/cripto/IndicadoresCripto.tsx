import type { FilaIndicador } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TituloTabla } from "@/components/ui/TituloTabla";
import { IndicadorRow } from "@/components/macroUsa/IndicadorRow";

interface IndicadoresCriptoProps {
  indicadores: FilaIndicador[];
  error: string | null;
}

/** Mismo formato que `IndicadoresMacro` (lista nombre/valor), pero sin agrupar por país: acá todo es un solo mercado. */
export function IndicadoresCripto({ indicadores, error }: IndicadoresCriptoProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/30">
      <TituloTabla titulo="Indicadores cripto" />
      {error && (
        <div className="px-2.5 py-2">
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      )}
      {!error && indicadores.length > 0 && (
        <div className="flex flex-col gap-1 py-1">
          {indicadores.map((indicador, i) => (
            <IndicadorRow key={indicador.nombre} indicador={indicador} zebra={i % 2 === 1} />
          ))}
        </div>
      )}
      {!error && indicadores.length === 0 && <p className="px-2.5 py-2 text-sm text-muted-foreground">No hay indicadores para mostrar.</p>}
    </div>
  );
}
