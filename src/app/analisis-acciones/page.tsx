import { ChartPieSlice, GridFour } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { MapaCalorAcciones } from "@/components/acciones/MapaCalorAcciones";
import { TablaSectores } from "@/components/acciones/TablaSectores";
import { Modulo } from "@/components/ui/Modulo";
import { getPanelLider } from "@/lib/iol/cotizaciones";
import type { FilaCotizacion } from "@/lib/types";

export const metadata: Metadata = {
  title: "Análisis de acciones",
  description: "Mapa de calor del Panel Líder: color según la variación del día, tamaño según la cantidad de operaciones.",
};

async function fetchPanelLider(): Promise<{ datos: FilaCotizacion[] | null; error: string | null }> {
  try {
    return { datos: await getPanelLider(), error: null };
  } catch (cause) {
    console.error("[analisis-acciones]", cause);
    return { datos: null, error: "No se pudo cargar el Panel Líder. Probá recargar la página en unos minutos." };
  }
}

export default async function AnalisisAccionesPage() {
  const { datos, error } = await fetchPanelLider();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Análisis de acciones</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Mapa de calor del Panel Líder — el tamaño de cada acción es la cantidad de operaciones del día, el color es la variación.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 max-sm:px-2.5 max-sm:py-2">
          {error}
        </p>
      )}

      {datos && (
        <>
          <Modulo
            titulo="Mapa de calor sectorizado"
            descripcion="Tamaño por cantidad de operaciones, color por variación del día"
            Icono={GridFour}
          >
            <div className="flex flex-col gap-3">
              <MapaCalorAcciones datos={datos} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Baja</span>
                <span
                  className="h-2.5 w-40 rounded-full"
                  style={{ background: "linear-gradient(90deg, #F87171, #3a3a3a, #34D399)" }}
                />
                <span>Sube</span>
              </div>
            </div>
          </Modulo>

          <Modulo
            titulo="Variación por sector"
            descripcion="Promedio ponderado por cantidad de operaciones — un banco muy operado pesa más que uno casi sin volumen"
            Icono={ChartPieSlice}
          >
            <TablaSectores datos={datos} />
          </Modulo>
        </>
      )}
    </main>
  );
}
