import { GridFour } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { MapaCalorTradingView } from "@/components/acciones/MapaCalorTradingView";
import { Modulo } from "@/components/ui/Modulo";

export const metadata: Metadata = {
  title: "Análisis de acciones",
  description: "Mapa de calor en vivo de TradingView, sectorizado: Merval, todas las acciones argentinas o el S&P 500.",
};

export default function AnalisisAccionesPage() {
  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Análisis de acciones</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Mapa de calor en vivo de TradingView, agrupado por sector.</p>
      </div>

      <Modulo
        titulo="Mapa de calor"
        descripcion="Elegí Merval, todas las acciones argentinas o el S&P 500 — agrupado por sector, tamaño por capitalización, color por variación del día"
        Icono={GridFour}
      >
        <MapaCalorTradingView />
      </Modulo>
    </main>
  );
}
