import type { Metadata } from "next";
import { BonosCurvaSection } from "@/components/bonos/BonosCurvaSection";
import { BonosSheetSection } from "@/components/bonos/BonosSheetSection";
import { getBonosSheet } from "@/lib/googlesheets/bonos";

export const metadata: Metadata = {
  title: "Calculadora de bonos",
  description:
    "Precio, TIR, duration y convexidad de bonos soberanos argentinos en dólares (ley local y ley " +
    "extranjera), con curvas de rendimiento y regresión para identificar bonos relativamente baratos o caros.",
};

async function fetchBonosSheet() {
  try {
    return { filas: await getBonosSheet(), error: null as string | null };
  } catch (cause) {
    console.error("[bonos-sheet]", cause);
    return {
      filas: null,
      error: "No se pudo cargar la tabla de bonos. Probá recargar la página en unos minutos.",
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
          Precio, TIR, duration y convexidad de bonos soberanos argentinos en dólares, con curvas de
          rendimiento para comparar ley local y ley extranjera.
        </p>
      </div>

      <BonosSheetSection {...bonosSheet} />

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
        <BonosCurvaSection
          {...bonosSheet}
          seccion="ley local"
          titulo="Curva de rendimientos — Ley local"
          descripcion="TIR vs. duration de los bonos soberanos en dólares bajo ley argentina."
        />
        <BonosCurvaSection
          {...bonosSheet}
          seccion="ley new york"
          titulo="Curva de rendimientos — Ley extranjera"
          descripcion="TIR vs. duration de los bonos soberanos en dólares bajo ley de Nueva York."
        />
      </div>
    </main>
  );
}
