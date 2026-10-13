import type { LecapFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LecapsCurvaChart } from "./LecapsCurvaChart";

interface LecapsCurvaSectionProps {
  filas: LecapFila[] | null;
  error: string | null;
}

export function LecapsCurvaSection({ filas, error }: LecapsCurvaSectionProps) {
  return (
    <section className="flex flex-col gap-2 sm:gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">Curva de rendimientos — LECAPs</h2>
      </header>

      {error ? <ErrorMessage>{error}</ErrorMessage> : <LecapsCurvaChart filas={filas ?? []} />}
    </section>
  );
}
