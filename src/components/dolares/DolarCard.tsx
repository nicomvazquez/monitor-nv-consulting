import { formatPrice } from "@/lib/format";
import type { Dolar } from "@/lib/dolarapi/types";

export function DolarCard({ dolar }: { dolar: Dolar }) {
  return (
    <div className="flex-none whitespace-nowrap rounded-lg border border-accent/20 bg-white/[0.03] px-3 py-2">
      <h3 className="whitespace-nowrap text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        {dolar.nombre}
      </h3>
      <dl className="mt-1 flex gap-3">
        <div>
          <dt className="whitespace-nowrap text-[0.7rem] text-muted-foreground/70">Compra</dt>
          <dd className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-foreground">
            ${formatPrice(dolar.compra)}
          </dd>
        </div>
        <div>
          <dt className="whitespace-nowrap text-[0.7rem] text-muted-foreground/70">Venta</dt>
          <dd className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-accent">
            ${formatPrice(dolar.venta)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
