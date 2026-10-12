import type { BonoFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { BonosCurvaChart } from "./BonosCurvaChart";

interface BonosCurvaSectionProps {
  filas: BonoFila[] | null;
  error: string | null;
  /** Título de la sección de la hoja a graficar (ej. "ley local", "ley new york"). */
  seccion: string;
  titulo: string;
}

export function BonosCurvaSection({ filas, error, seccion, titulo }: BonosCurvaSectionProps) {
  return (
    <section className="flex flex-col gap-2 sm:gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">{titulo}</h2>
      </header>

      {error ? <ErrorMessage>{error}</ErrorMessage> : <BonosCurvaChart filas={filas ?? []} seccion={seccion} />}
    </section>
  );
}
