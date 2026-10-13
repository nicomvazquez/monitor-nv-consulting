import type { LecapFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LecapsTable } from "./LecapsTable";

interface LecapsSectionProps {
  filas: LecapFila[] | null;
  error: string | null;
}

export function LecapsSection({ filas, error }: LecapsSectionProps) {
  return (
    <section className="flex flex-col gap-2 sm:gap-3">
      <header>
        <h2 className="text-base font-semibold text-foreground">Análisis de LECAPs</h2>
      </header>

      {error ? <ErrorMessage>{error}</ErrorMessage> : <LecapsTable filas={filas ?? []} />}
    </section>
  );
}
