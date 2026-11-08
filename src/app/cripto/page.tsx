import { GridFour } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { CryptoLivePanel } from "@/components/cryptos/CryptoLivePanel";
import { MapaCalorCriptoTradingView } from "@/components/cripto/MapaCalorCriptoTradingView";
import { Modulo } from "@/components/ui/Modulo";
import { getCryptosIniciales } from "@/lib/binance/cryptos";

export const metadata: Metadata = {
  title: "Cripto",
  description: "Mapa de calor en vivo de TradingView y cotizaciones de las principales criptomonedas, con ficha de análisis por moneda.",
};

export default async function CriptoPage() {
  const cryptosIniciales = await getCryptosIniciales();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Cripto</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Mapa de calor en vivo de TradingView y cotizaciones en vivo de Binance — hacé click en una moneda para ver su ficha de análisis.
        </p>
      </div>

      <Modulo titulo="Mapa de calor" descripcion="Agrupado por categoría, tamaño por market cap, color por variación de 24hs" Icono={GridFour}>
        <MapaCalorCriptoTradingView />
      </Modulo>

      <CryptoLivePanel inicial={cryptosIniciales} />
    </main>
  );
}
