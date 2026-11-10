import { Percent } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { CalculadoraTirSection } from "@/components/bonos/CalculadoraTirSection";
import { Modulo } from "@/components/ui/Modulo";
import { getDatosCalculadoraTir, getUniversoBonosCalculadora } from "@/lib/docta/calculadoraTir";

export const metadata: Metadata = {
  title: "Calculadora",
  description:
    "Elegí cualquier bono soberano u obligación negociable, tipeá el precio que quieras y calculá su " +
    "TIR, TEA, TNA, duration, convexidad y cashflow completo, con datos de Docta Capital.",
};

/** Sin ticker en la URL, no se pide nada a Docta — la cuota de 15 pedidos/día (ver `lib/docta/cashflow.ts`) solo se gasta cuando alguien elige un bono de verdad. */
async function fetchDatosTir(ticker: string | null) {
  if (!ticker) return { datos: null, error: null as string | null };
  return getDatosCalculadoraTir(ticker);
}

async function fetchUniversoTir() {
  try {
    return { instrumentos: await getUniversoBonosCalculadora(), error: null as string | null };
  } catch (cause) {
    console.error("[calculadora-tir-universo]", cause);
    return { instrumentos: [], error: "No se pudo cargar la lista de bonos disponibles." };
  }
}

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await searchParams;
  const tickerSeleccionado = ticker?.trim() || null;

  const [universoTir, datosTir] = await Promise.all([fetchUniversoTir(), fetchDatosTir(tickerSeleccionado)]);

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-8 max-sm:gap-4 px-6 max-sm:px-1 py-8 max-sm:py-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Calculadora</h1>
      </div>

      <Modulo
        titulo="TIR por bono"
        descripcion="Elegí cualquier bono (soberano u ON), tipeá el precio que quieras y calculá su TIR, TEA, TNA, duration y cashflow completo"
        Icono={Percent}
      >
        <CalculadoraTirSection
          instrumentos={universoTir.instrumentos}
          tickerSeleccionado={tickerSeleccionado}
          datos={datosTir.datos}
          error={universoTir.error ?? datosTir.error}
        />
      </Modulo>
    </main>
  );
}
