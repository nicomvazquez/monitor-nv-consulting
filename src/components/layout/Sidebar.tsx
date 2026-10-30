import type { BcraVariable } from "@/lib/bcra/types";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import type { FilaIndicador } from "@/lib/types";
import { IndicadoresMacro } from "@/components/macro/IndicadoresMacro";
import { DescargarReporteButton } from "@/components/reportes/DescargarReporteButton";

interface SidebarProps {
  indicadores: BcraVariable[] | null;
  error: string | null;
  riesgoPais: RiesgoPais | null;
  riesgoPaisError: string | null;
  indicadoresUsa: FilaIndicador[] | null;
  errorUsa: string | null;
  vix: FilaIndicador | null;
  vixError: string | null;
  estaLogueado: boolean;
}

export function Sidebar({
  indicadores,
  error,
  riesgoPais,
  riesgoPaisError,
  indicadoresUsa,
  errorUsa,
  vix,
  vixError,
  estaLogueado,
}: SidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-3 lg:w-80 lg:flex-none">
      <DescargarReporteButton estaLogueado={estaLogueado} />
      <IndicadoresMacro
        indicadores={indicadores}
        error={error}
        riesgoPais={riesgoPais}
        riesgoPaisError={riesgoPaisError}
        indicadoresUsa={indicadoresUsa}
        errorUsa={errorUsa}
        vix={vix}
        vixError={vixError}
      />
    </aside>
  );
}
