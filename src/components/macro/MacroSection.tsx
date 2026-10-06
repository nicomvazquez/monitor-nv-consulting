import type { BcraVariable } from "@/lib/bcra/types";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { MacroCard } from "./MacroCard";
import { RiesgoPaisCard } from "./RiesgoPaisCard";

interface MacroSectionProps {
  indicadores: BcraVariable[] | null;
  error: string | null;
  riesgoPais: RiesgoPais | null;
  riesgoPaisError: string | null;
}

export function MacroSection({ indicadores, error, riesgoPais, riesgoPaisError }: MacroSectionProps) {
  const hayContenido = riesgoPais !== null || (indicadores !== null && indicadores.length > 0);

  return (
    <section className="flex flex-col gap-2">
      <header>
        <h2 className="text-base font-semibold text-foreground">Indicadores macro</h2>
        <p className="text-xs text-muted-foreground">Riesgo país y variables monetarias.</p>
      </header>

      {hayContenido && (
        <div className="overflow-hidden rounded-lg border border-border/60">
          {riesgoPais && <RiesgoPaisCard riesgoPais={riesgoPais} />}
          <div className="divide-y divide-border/40">
            {indicadores?.map((variable) => <MacroCard key={variable.idVariable} variable={variable} />)}
          </div>
        </div>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {riesgoPaisError && <ErrorMessage>{riesgoPaisError}</ErrorMessage>}
      {!hayContenido && !error && !riesgoPaisError && (
        <p className="text-sm text-muted-foreground">No hay indicadores para mostrar.</p>
      )}
    </section>
  );
}
