import type { RiesgoPais } from "@/lib/argentinadatos/types";

/** `fecha` es solo calendario ("YYYY-MM-DD", sin hora): reformatear como texto
 * evita el corrimiento de un día que da pasar por `Date` + timezone. */
function formatFecha(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Fila destacada (fondo acento), una sola línea: encabeza la lista de indicadores macro. */
export function RiesgoPaisCard({ riesgoPais }: { riesgoPais: RiesgoPais }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-accent/10 px-2.5 py-2.5">
      <p className="min-w-0 truncate text-xs font-semibold tracking-wide text-accent uppercase">
        Riesgo país <span className="font-normal text-accent/60 normal-case">· Al {formatFecha(riesgoPais.fecha)}</span>
      </p>
      <p className="flex-none font-mono text-base font-bold tabular-nums text-accent">
        {riesgoPais.valor.toLocaleString("es-AR")} <span className="text-xs font-medium">pb</span>
      </p>
    </div>
  );
}
