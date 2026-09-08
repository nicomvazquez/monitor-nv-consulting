import type { Metadata } from "next";
import { BonosSheetSection } from "@/components/bonos/BonosSheetSection";
import { getBonosSheet } from "@/lib/googlesheets/bonos";

export const metadata: Metadata = {
  title: "Calculadora de bonos — Cotizaciones IOL",
};

async function fetchBonosSheet() {
  try {
    return { filas: await getBonosSheet(), error: null as string | null };
  } catch (cause) {
    return {
      filas: null,
      error: cause instanceof Error ? cause.message : "Error desconocido al consultar Google Sheets.",
    };
  }
}

export default async function CalculadoraBonosPage() {
  const bonosSheet = await fetchBonosSheet();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calculadora de bonos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Por ahora, la tabla de referencia de la hoja de cálculo. La calculadora interactiva viene después.
        </p>
      </div>

      <BonosSheetSection {...bonosSheet} />
    </main>
  );
}
