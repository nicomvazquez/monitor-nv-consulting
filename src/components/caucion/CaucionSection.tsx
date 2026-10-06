import type { FilaCotizacion } from "@/lib/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { CaucionList } from "./CaucionList";

interface CaucionSectionProps {
  items: FilaCotizacion[] | null;
  error: string | null;
}

/** Mismo patrón que `PanelSection`/`MacroSection`: header simple + contenido, sin tarjeta envolvente. */
export function CaucionSection({ items, error }: CaucionSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <header>
        <h2 className="text-base font-semibold text-foreground">Caución</h2>
        <p className="text-xs text-muted-foreground">TNA a 1, 7 y 14 días, en pesos y en dólares.</p>
      </header>

      {error ? <ErrorMessage>{error}</ErrorMessage> : <CaucionList items={items ?? []} />}
    </section>
  );
}
