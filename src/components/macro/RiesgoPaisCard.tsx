import type { RiesgoPais } from "@/lib/argentinadatos/types";

/** `fecha` es solo calendario ("YYYY-MM-DD", sin hora): reformatear como texto
 * evita el corrimiento de un día que da pasar por `Date` + timezone. */
function formatFecha(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Fila destacada (fondo/borde ámbar): encabeza la lista de indicadores macro, resaltada del resto. */
export function RiesgoPaisCard({ riesgoPais }: { riesgoPais: RiesgoPais }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-accent/30 bg-accent/10 px-3 py-2.5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-accent uppercase">Riesgo país</p>
        <p className="text-[0.7rem] text-muted-foreground/70">Al {formatFecha(riesgoPais.fecha)}</p>
      </div>
      <p className="flex-none font-mono text-lg font-bold tabular-nums text-accent">
        {riesgoPais.valor.toLocaleString("es-AR")} <span className="text-xs font-medium">pb</span>
      </p>
    </div>
  );
}
