import type { BonoFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BonosSheetTable } from "./BonosSheetTable";

interface BonosSheetSectionProps {
  filas: BonoFila[] | null;
  error: string | null;
}

export function BonosSheetSection({ filas, error }: BonosSheetSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">Análisis de bonos soberanos</h2>
        <p className="text-xs text-muted-foreground">Precio, TIR, duration y convexidad, actualizados periódicamente.</p>
      </header>

      {error ? <ErrorMessage>{error}</ErrorMessage> : <BonosSheetTable filas={filas ?? []} />}
    </section>
  );
}
