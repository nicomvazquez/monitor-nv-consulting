import type { LecapFila } from "@/lib/googlesheets/types";
import { formatPrice } from "@/lib/format";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CarryTradeTable } from "./CarryTradeTable";

interface CarryTradeSectionProps {
  filas: LecapFila[] | null;
  error: string | null;
  dolarMep: { compra: number; venta: number } | null;
}

export function CarryTradeSection({ filas, error, dolarMep }: CarryTradeSectionProps) {
  return (
    <section className="flex flex-col gap-2 sm:gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">Carry trade — breakeven contra el dólar</h2>
        {dolarMep && (
          <p className="mt-1 text-xs text-muted-foreground">
            Vender dólares hoy a ${formatPrice(dolarMep.compra)} (MEP), invertir en la letra y recomprar dólares al
            vencimiento. &ldquo;Breakeven mensual&rdquo; es la devaluación promedio del dólar, mes a mes, a partir de
            la cual dejaría de convenir quedarse en pesos — comparable directo con la TEM de la letra. Cálculo
            ilustrativo,
            asume que el spread compra/venta de hoy se mantiene; no es una recomendación de inversión.
          </p>
        )}
      </header>

      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : !dolarMep ? (
        <ErrorMessage>No se pudo cargar la cotización del dólar MEP para este cálculo.</ErrorMessage>
      ) : (
        <CarryTradeTable filas={filas ?? []} dolar={dolarMep} />
      )}
    </section>
  );
}
