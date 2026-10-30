import type { BonoFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ModuloSeccion } from "@/components/ui/Modulo";
import { BonosSheetTable } from "./BonosSheetTable";

interface BonosSheetSectionProps {
  filas: BonoFila[] | null;
  error: string | null;
}

export function BonosSheetSection({ filas, error }: BonosSheetSectionProps) {
  return (
    <ModuloSeccion titulo="Análisis de bonos soberanos">
      {error ? <ErrorMessage>{error}</ErrorMessage> : <BonosSheetTable filas={filas ?? []} />}
    </ModuloSeccion>
  );
}
