import type { BonoFila } from "@/lib/googlesheets/types";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ModuloSeccion } from "@/components/ui/Modulo";
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
    <ModuloSeccion titulo={titulo}>
      {error ? <ErrorMessage>{error}</ErrorMessage> : <BonosCurvaChart filas={filas ?? []} seccion={seccion} />}
    </ModuloSeccion>
  );
}
