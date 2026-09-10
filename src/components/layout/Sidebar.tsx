import type { ReactNode } from "react";
import type { BcraVariable } from "@/lib/bcra/types";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import type { FilaIndicador } from "@/lib/types";
import { MacroSection } from "@/components/macro/MacroSection";
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
  /** El panel de Caución, ya armado (mismo `PanelSection` que el resto de tablas). */
  caucion: ReactNode;
}

export function Sidebar({
  caucion,
  indicadoresUsa,
  errorUsa,
  vix,
  vixError,
  ...macro
}: SidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-5 lg:w-72 lg:flex-none">
      {caucion}
      <MacroSection {...macro} />
      <MacroUsaSection indicadores={indicadoresUsa} error={errorUsa} vix={vix} vixError={vixError} />
    </aside>
  );
}
