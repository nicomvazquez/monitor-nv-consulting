import type { FilaCotizacion } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CotizacionesTable } from "./CotizacionesTable";

interface PanelSectionProps {
  title: string;
  /** Opcional: solo vale la pena si agrega algo que el título no dice (qué instrumentos incluye, criterio de selección). */
  description?: string;
  items: FilaCotizacion[] | null;
  error: string | null;
  mostrarVariacion?: boolean;
  /** Todos los paneles de IOL y Yahoo Finance traen volumen; se muestra por defecto. */
  mostrarVolumen?: boolean;
  columnaPrecio?: string;
}

export function PanelSection({
  title,
  description,
  items,
  error,
  mostrarVariacion,
  mostrarVolumen = true,
  columnaPrecio,
}: PanelSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <header>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
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
