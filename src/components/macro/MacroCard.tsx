import { formatPrice } from "@/lib/format";
import type { BcraVariable } from "@/lib/bcra/types";

const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatValor({ unidadExpresion, moneda, ultValorInformado }: BcraVariable): string {
  if (unidadExpresion.toLowerCase().includes("porcentaje")) {
    return `${formatPrice(ultValorInformado)}%`;
  }
  // Valor de índice (ej. UVA): no es ni un porcentaje ni un monto en pesos/dólares.
  if (unidadExpresion.toLowerCase().includes("índice")) {
    return formatPrice(ultValorInformado);
  }
  const prefijo = moneda === "ME" ? "US$" : "$";
  // Espacio irrompible entre el número y la unidad: en una columna angosta,
  // un espacio normal ahí deja a la "M" sola colgando en su propia línea.
  return `${prefijo} ${formatPrice(ultValorInformado)} M`;
}

/**
 * Fila de una sola línea (label + fecha abreviada, truncados juntos, más el
 * valor a la derecha) — antes eran 2-3 líneas por fila (label, fecha y valor
 * apilados en mobile), lo que hacía larguísima una lista de 7-8 indicadores.
 * `title` en el contenedor recupera el texto completo si quedó truncado.
 */
export function MacroCard({ variable, zebra = false }: { variable: BcraVariable; zebra?: boolean }) {
  return (
    <div
      title={variable.descripcion.replace(/\.$/, "")}
      className={"flex items-center justify-between gap-3 px-2.5 py-2.5 transition-colors hover:bg-accent/10 " + (zebra ? "bg-white/[0.025]" : "")}
    >
      <p className="min-w-0 truncate text-xs text-muted-foreground">
        {variable.descripcion.replace(/\.$/, "")}
        <span className="text-muted-foreground/50"> · {formateadorFecha.format(new Date(variable.ultFechaInformada))}</span>
      </p>
      <p className="flex-none font-mono text-sm font-semibold tabular-nums text-foreground">{formatValor(variable)}</p>
    </div>
  );
}
