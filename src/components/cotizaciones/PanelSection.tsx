import type { FilaCotizacion } from "@/lib/iol/types";
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
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </header>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
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
