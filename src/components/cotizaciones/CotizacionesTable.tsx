import type { FilaCotizacion } from "@/lib/iol/types";
import { formatPrice } from "@/lib/format";
import { VariacionBadge } from "./VariacionBadge";

interface CotizacionesTableProps {
  items: FilaCotizacion[];
  /** Poner en `false` para ocultar la columna Variación (ej. caución, donde no aplica). */
  mostrarVariacion?: boolean;
  /** Título de la columna de precio: "Último" con mercado abierto, "Cierre" con mercado cerrado. */
  columnaPrecio?: string;
}

export function CotizacionesTable({
  items,
  mostrarVariacion = true,
  columnaPrecio = "Último",
}: CotizacionesTableProps) {
  if (items.length === 0) {
    return <p className="text-gray-500">No hay cotizaciones para mostrar.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold text-gray-700">
              Símbolo
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700">
              {columnaPrecio}
            </th>
            {mostrarVariacion && (
              <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700">
                Variación
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.simbolo} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{item.simbolo}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {item.ultimoPrecio !== null ? formatPrice(item.ultimoPrecio) : "-"}
              </td>
              {mostrarVariacion && (
                <td className="px-4 py-3 text-right">
                  <VariacionBadge variacion={item.variacionPorcentual} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
