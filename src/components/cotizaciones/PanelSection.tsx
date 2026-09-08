import type { FilaCotizacion } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CotizacionesTable } from "./CotizacionesTable";

interface PanelSectionProps {
  title: string;
  description: string;
  items: FilaCotizacion[] | null;
  error: string | null;
  mostrarVariacion?: boolean;
  columnaPrecio?: string;
}

export function PanelSection({
  title,
  description,
  items,
  error,
  mostrarVariacion,
  columnaPrecio,
}: PanelSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </header>

      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <CotizacionesTable
          items={items ?? []}
          mostrarVariacion={mostrarVariacion}
          columnaPrecio={columnaPrecio}
        />
      )}
    </section>
  );
}
