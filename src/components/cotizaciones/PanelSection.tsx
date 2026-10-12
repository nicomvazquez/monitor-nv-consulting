import type { FilaCotizacion } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CotizacionesTable } from "./CotizacionesTable";

interface PanelSectionProps {
  title: string;
  items: FilaCotizacion[] | null;
  error: string | null;
  mostrarVariacion?: boolean;
  /** Todos los paneles de IOL y Yahoo Finance traen volumen; se muestra por defecto. */
  mostrarVolumen?: boolean;
  columnaPrecio?: string;
}

export function PanelSection({
  title,
  items,
  error,
  mostrarVariacion,
  mostrarVolumen = true,
  columnaPrecio,
}: PanelSectionProps) {
  return (
    <section className="flex flex-col gap-1.5 sm:gap-2">
      <header>
        <h2 className="text-base max-sm:text-sm font-semibold text-foreground">{title}</h2>
      </header>

      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <CotizacionesTable
          items={items ?? []}
          mostrarVariacion={mostrarVariacion}
          mostrarVolumen={mostrarVolumen}
          columnaPrecio={columnaPrecio}
        />
      )}
    </section>
  );
}
