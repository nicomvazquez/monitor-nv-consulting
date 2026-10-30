import type { LecapFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ModuloSeccion } from "@/components/ui/Modulo";
import { LecapsCurvaChart } from "./LecapsCurvaChart";

interface LecapsCurvaSectionProps {
  filas: LecapFila[] | null;
  error: string | null;
}

export function LecapsCurvaSection({ filas, error }: LecapsCurvaSectionProps) {
  return (
    <ModuloSeccion titulo="Curva de rendimientos — LECAPs">
      {error ? <ErrorMessage>{error}</ErrorMessage> : <LecapsCurvaChart filas={filas ?? []} />}
    </ModuloSeccion>
  );
}
