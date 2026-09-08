import { formatPrice } from "@/lib/format";
import type { BcraVariable } from "@/lib/bcra/types";

const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

function formatValor({ unidadExpresion, moneda, ultValorInformado }: BcraVariable): string {
  if (unidadExpresion.toLowerCase().includes("porcentaje")) {
    return `${formatPrice(ultValorInformado)}%`;
  }
  const prefijo = moneda === "ME" ? "US$" : "$";
  return `${prefijo} ${formatPrice(ultValorInformado)} M`;
}

/** Fila compacta (no tarjeta): pensada para apilarse dentro de un único contenedor con bordes, como filas de tabla. */
export function MacroCard({ variable }: { variable: BcraVariable }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{variable.descripcion.replace(/\.$/, "")}</p>
        <p className="text-[0.7rem] text-muted-foreground/60">
          {formateadorFecha.format(new Date(variable.ultFechaInformada))}
        </p>
      </div>
      <p className="flex-none font-mono text-sm font-semibold tabular-nums text-foreground">
        {formatValor(variable)}
      </p>
    </div>
  );
}
