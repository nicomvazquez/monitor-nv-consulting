import type { LecapFila } from "@/lib/googlesheets/types";
import { formatPrice } from "@/lib/format";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ModuloSeccion } from "@/components/ui/Modulo";
import { CarryTradeTable } from "./CarryTradeTable";

interface CarryTradeSectionProps {
  filas: LecapFila[] | null;
  error: string | null;
  dolarMep: { compra: number; venta: number } | null;
}

export function CarryTradeSection({ filas, error, dolarMep }: CarryTradeSectionProps) {
  return (
    <ModuloSeccion titulo="Carry trade — breakeven contra el dólar">
      {dolarMep && (
        <p className="mb-2 text-xs text-muted-foreground">
          Vender dólares hoy a ${formatPrice(dolarMep.compra)} (MEP), invertir en la letra y recomprar dólares al
          vencimiento. &ldquo;Breakeven mensual&rdquo; es la devaluación promedio del dólar, mes a mes, a partir de la
          cual dejaría de convenir quedarse en pesos — comparable directo con la TEM de la letra. Cálculo ilustrativo,
          asume que el spread compra/venta de hoy se mantiene; no es una recomendación de inversión.
        </p>
      )}

      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : !dolarMep ? (
        <ErrorMessage>No se pudo cargar la cotización del dólar MEP para este cálculo.</ErrorMessage>
      ) : (
        <CarryTradeTable filas={filas ?? []} dolar={dolarMep} />
      )}
    </ModuloSeccion>
  );
}
