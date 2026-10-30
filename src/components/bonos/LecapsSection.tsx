import type { LecapFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ModuloSeccion } from "@/components/ui/Modulo";
import { LecapsTable } from "./LecapsTable";

interface LecapsSectionProps {
  filas: LecapFila[] | null;
  error: string | null;
}

export function LecapsSection({ filas, error }: LecapsSectionProps) {
  return (
    <ModuloSeccion titulo="Análisis de LECAPs">
      {error ? <ErrorMessage>{error}</ErrorMessage> : <LecapsTable filas={filas ?? []} />}
    </ModuloSeccion>
  );
}
