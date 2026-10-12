import type { BcraVariable } from "@/lib/bcra/types";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import type { FilaIndicador } from "@/lib/types";
import { MacroSection } from "@/components/macro/MacroSection";
import { DescargarReporteButton } from "@/components/reportes/DescargarReporteButton";
import { MacroUsaSection } from "@/components/macroUsa/MacroUsaSection";

interface SidebarProps {
  indicadores: BcraVariable[] | null;
  error: string | null;
  riesgoPais: RiesgoPais | null;
  riesgoPaisError: string | null;
  indicadoresUsa: FilaIndicador[] | null;
  errorUsa: string | null;
  vix: FilaIndicador | null;
  vixError: string | null;
}

export function Sidebar({
  indicadoresUsa,
  errorUsa,
  vix,
  vixError,
  ...macro
}: SidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-72 lg:flex-none">
      <DescargarReporteButton />
      {/* En mobile, los dos bloques macro van lado a lado; desde sm, apilados como siempre. */}
      <div className="flex flex-col gap-4 max-sm:grid max-sm:grid-cols-2 max-sm:gap-3">
        <MacroSection {...macro} />
        <MacroUsaSection indicadores={indicadoresUsa} error={errorUsa} vix={vix} vixError={vixError} />
      </div>
    </aside>
  );
}
