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
  if (error) {
    return (
      <section className="flex flex-col gap-2">
        <header className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-1 flex-none rounded-full bg-accent/70" />
          <h2 className="text-base max-sm:text-sm font-semibold text-foreground">{title}</h2>
        </header>
        <ErrorMessage>{error}</ErrorMessage>
      </section>
    );
  }

  return (
    <CotizacionesTable
      titulo={title}
      items={items ?? []}
      mostrarVariacion={mostrarVariacion}
      mostrarVolumen={mostrarVolumen}
      columnaPrecio={columnaPrecio}
    />
  );
}
