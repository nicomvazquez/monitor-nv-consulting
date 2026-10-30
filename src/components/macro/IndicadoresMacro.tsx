import type { BcraVariable } from "@/lib/bcra/types";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import type { FilaIndicador } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { TituloTabla } from "@/components/ui/TituloTabla";
import { IndicadorRow } from "@/components/macroUsa/IndicadorRow";
import { VixRow } from "@/components/macroUsa/VixRow";
import { MacroCard } from "./MacroCard";
import { RiesgoPaisCard } from "./RiesgoPaisCard";

interface IndicadoresMacroProps {
  indicadores: BcraVariable[] | null;
  error: string | null;
  riesgoPais: RiesgoPais | null;
  riesgoPaisError: string | null;
  indicadoresUsa: FilaIndicador[] | null;
  errorUsa: string | null;
  vix: FilaIndicador | null;
  vixError: string | null;
}

/** Encabezado de grupo dentro de la tabla: diferencia un país del otro sin volver a dibujar una tarjeta — alcanza con un fondo tenue y mayúsculas para marcar el corte. */
function GrupoPais({ titulo }: { titulo: string }) {
  return (
    <div className="bg-background/50 px-2.5 py-1.5 text-xs font-bold tracking-widest text-accent/80 uppercase">
      {titulo}
    </div>
  );
}

function EstadoVacio({ error, errorSecundario }: { error: string | null; errorSecundario: string | null }) {
  if (error || errorSecundario) {
    return (
      <div className="flex flex-col gap-1.5 px-2.5 py-2">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {errorSecundario && <ErrorMessage>{errorSecundario}</ErrorMessage>}
      </div>
    );
  }
  return (
    <p className="px-2.5 py-2 text-sm text-muted-foreground">No hay indicadores para mostrar.</p>
  );
}

/**
 * Antes: un `Modulo` genérico (ícono + título + bajada) conteniendo dos
 * secciones ("Argentina"/"Estados Unidos"), cada una con su propia caja —
 * dos tablas adentro de una tarjeta. Ahora es una sola tarjeta-tabla, con el
 * mismo header que usan las demás tablas del sitio (`TituloTabla`) y un
 * único cuerpo: Argentina arriba, Estados Unidos abajo, separados por un
 * rótulo de grupo (fondo tenue + mayúsculas) en vez de un borde propio.
 */
export function IndicadoresMacro({
  indicadores,
  error,
  riesgoPais,
  riesgoPaisError,
  indicadoresUsa,
  errorUsa,
  vix,
  vixError,
}: IndicadoresMacroProps) {
  const hayArgentina = riesgoPais !== null || (indicadores !== null && indicadores.length > 0);
  const hayUsa = vix !== null || (indicadoresUsa !== null && indicadoresUsa.length > 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/30">
      <TituloTabla titulo="Indicadores macro" />

      <GrupoPais titulo="Argentina" />
      {hayArgentina ? (
        <div className="flex flex-col gap-1 py-1">
          {riesgoPais && <RiesgoPaisCard riesgoPais={riesgoPais} />}
          {indicadores?.map((variable, i) => <MacroCard key={variable.idVariable} variable={variable} zebra={i % 2 === 1} />)}
        </div>
      ) : (
        <EstadoVacio error={error} errorSecundario={riesgoPaisError} />
      )}

      <GrupoPais titulo="Estados Unidos" />
      {hayUsa ? (
        <div className="flex flex-col gap-1 py-1">
          {vix && <VixRow vix={vix} />}
          {indicadoresUsa?.map((indicador, i) => <IndicadorRow key={indicador.nombre} indicador={indicador} zebra={i % 2 === 1} />)}
        </div>
      ) : (
        <EstadoVacio error={errorUsa} errorSecundario={vixError} />
      )}
    </div>
  );
}
