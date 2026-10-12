import type { FilaIndicador } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { IndicadorRow } from "./IndicadorRow";
import { VixRow } from "./VixRow";

interface MacroUsaSectionProps {
  indicadores: FilaIndicador[] | null;
  error: string | null;
  vix: FilaIndicador | null;
  vixError: string | null;
}

export function MacroUsaSection({ indicadores, error, vix, vixError }: MacroUsaSectionProps) {
  const hayContenido = vix !== null || (indicadores !== null && indicadores.length > 0);

  return (
    <section className="flex flex-col gap-1.5 sm:gap-2">
      <header>
        <h2 className="text-base max-sm:text-sm font-semibold text-foreground">Indicadores macro EE.UU.</h2>
      </header>

      {hayContenido && (
        <div className="overflow-hidden rounded-lg border border-border/60">
          {vix && <VixRow vix={vix} />}
          <div className="divide-y divide-border/40">
            {indicadores?.map((indicador) => <IndicadorRow key={indicador.nombre} indicador={indicador} />)}
          </div>
        </div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {vixError && <ErrorMessage>{vixError}</ErrorMessage>}
      {!hayContenido && !error && !vixError && (
        <p className="text-sm text-muted-foreground">No hay indicadores para mostrar.</p>
      )}
    </section>
  );
}
