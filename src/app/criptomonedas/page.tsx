import { Table } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { CriptoCompletaLivePanel } from "@/components/cryptos/CriptoCompletaLivePanel";
import { Modulo } from "@/components/ui/Modulo";
import { getCryptosCompletas } from "@/lib/binance/cryptos";

export const metadata: Metadata = {
  title: "Criptomonedas",
  description: "Las 30 criptomonedas más importantes por market cap, con precio, variación, apertura, máximo, mínimo, puntas y volumen en vivo.",
};

export default async function CriptomonedasPage() {
  const cryptos = await getCryptosCompletas();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Criptomonedas</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Las 30 más importantes por market cap, con todos los datos que informa Binance en vivo: precio, apertura, máximo, mínimo, cierre anterior, puntas
          de compra/venta, volumen y operaciones.
        </p>
      </div>

      <Modulo titulo="Cotizaciones" descripcion="Hacé click en una moneda para ver su ficha de análisis" Icono={Table}>
        <CriptoCompletaLivePanel inicial={cryptos} />
      </Modulo>
    </main>
  );
}
