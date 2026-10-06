import { formatPrice } from "@/lib/format";
import type { Dolar } from "@/lib/dolarapi/types";

/**
 * Sin las palabras "Compra"/"Venta": son dos números en el mismo orden en
 * las 7 tarjetas, así que la posición ya los identifica — el label repetido
 * 14 veces en el carrusel era puro ancho sin información nueva. El color
 * (mudo vs. acento) y el título `Compra / Venta` del `<dl>` conservan el
 * significado para quien use un lector de pantalla.
 */
export function DolarCard({ dolar }: { dolar: Dolar }) {
  return (
    <div className="flex-none whitespace-nowrap rounded-lg border border-accent/20 bg-white/[0.03] px-2.5 py-1.5">
      <h3 className="whitespace-nowrap text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {dolar.nombre}
      </h3>
      <dl title="Compra / Venta" className="mt-0.5 flex items-baseline gap-1.5 whitespace-nowrap">
        <dt className="sr-only">Compra</dt>
        <dd className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
          ${formatPrice(dolar.compra)}
        </dd>
        <span aria-hidden className="text-muted-foreground/30">
          /
        </span>
        <dt className="sr-only">Venta</dt>
        <dd className="font-mono text-sm font-semibold tabular-nums text-accent">${formatPrice(dolar.venta)}</dd>
      </dl>
    </div>
  );
}
