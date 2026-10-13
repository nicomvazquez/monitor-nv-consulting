import type { Metadata } from "next";
import { CalculadoraBonosTabs } from "@/components/bonos/CalculadoraBonosTabs";
import { getDolares } from "@/lib/dolarapi/dolares";
import { getBonosSheet } from "@/lib/googlesheets/bonos";
import { getLecapsSheet } from "@/lib/googlesheets/lecaps";

export const metadata: Metadata = {
  title: "Calculadora de bonos",
  description:
    "Precio, TIR, duration y convexidad de bonos soberanos argentinos en dólares (ley local y ley " +
    "extranjera) y de LECAPs en pesos, con curvas de rendimiento y regresión para identificar bonos " +
    "relativamente baratos o caros.",
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

async function fetchLecapsSheet() {
  try {
    return { filas: await getLecapsSheet(), error: null as string | null };
  } catch (cause) {
    console.error("[lecaps-sheet]", cause);
    return {
      filas: null,
      error: "No se pudo cargar la tabla de LECAPs. Probá recargar la página en unos minutos.",
    };
  }
}

/** Solo el MEP: es el dólar de referencia habitual para esta operatoria (comprar/vender pesos adentro del sistema financiero local), a diferencia del CCL (pensado para sacar plata afuera). */
async function fetchDolarMep() {
  try {
    const dolares = await getDolares();
    const mep = dolares.find((d) => d.casa === "bolsa");
    return mep ? { compra: mep.compra, venta: mep.venta } : null;
  } catch (cause) {
    console.error("[dolar-mep-carry-trade]", cause);
    return null;
  }
}

export default async function CalculadoraBonosPage() {
  const [bonosSheet, lecapsSheet, dolarMep] = await Promise.all([
    fetchBonosSheet(),
    fetchLecapsSheet(),
    fetchDolarMep(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-8 max-sm:gap-4 px-6 max-sm:px-2 py-8 max-sm:py-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Calculadora de bonos</h1>
      </div>

      <CalculadoraBonosTabs bonos={bonosSheet} lecaps={lecapsSheet} dolarMep={dolarMep} />
    </main>
  );
}
