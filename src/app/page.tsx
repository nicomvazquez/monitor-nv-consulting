import { CaucionSection } from "@/components/caucion/CaucionSection";
import { CryptoLivePanel } from "@/components/cryptos/CryptoLivePanel";
import { Sidebar } from "@/components/layout/Sidebar";
import { PanelSection } from "@/components/cotizaciones/PanelSection";
import { getRiesgoPais } from "@/lib/argentinadatos/riesgoPais";
import { getIndicadoresMacro } from "@/lib/bcra/macro";
import { getCryptosIniciales } from "@/lib/binance/cryptos";
import { getCaucionesTabla } from "@/lib/iol/caucion";
import {
  getBonosCer,
  getBonosSoberanosDolaresMep,
  getCedearsPrincipales,
  getLetras,
  getPanelLider,
} from "@/lib/iol/cotizaciones";
import { isMercadoAbierto } from "@/lib/iol/market-hours";
import type { FilaCotizacion } from "@/lib/types";

async function fetchPanel(fetcher: () => Promise<FilaCotizacion[]>) {
  try {
    return { items: await fetcher(), error: null as string | null };
  } catch (cause) {
    return {
      items: null,
      error: cause instanceof Error ? cause.message : "Error desconocido al consultar IOL.",
    };
  }
}

async function fetchMacro() {
  try {
    return { indicadores: await getIndicadoresMacro(), error: null as string | null };
  } catch (cause) {
    return {
      indicadores: null,
      error: cause instanceof Error ? cause.message : "Error desconocido al consultar la API del BCRA.",
    };
  }
}

async function fetchRiesgoPais() {
  try {
    return { riesgoPais: await getRiesgoPais(), riesgoPaisError: null as string | null };
  } catch (cause) {
    return {
      riesgoPais: null,
      riesgoPaisError:
        cause instanceof Error ? cause.message : "Error desconocido al consultar ArgentinaDatos.",
    };
  }
}

export default async function HomePage() {
  const [macro, riesgoPais, cryptosIniciales, caucion, panelLider, cedears, bonosDolares, letras, bonosCer] =
    await Promise.all([
      fetchMacro(),
      fetchRiesgoPais(),
      getCryptosIniciales(),
      fetchPanel(getCaucionesTabla),
      fetchPanel(getPanelLider),
      fetchPanel(getCedearsPrincipales),
      fetchPanel(getBonosSoberanosDolaresMep),
      fetchPanel(getLetras),
      fetchPanel(getBonosCer),
    ]);

  const columnaPrecio = isMercadoAbierto() ? "Último" : "Cierre";

  return (
    <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-8 px-6 py-8 lg:flex-row lg:items-start">
      <Sidebar {...macro} {...riesgoPais} caucion={<CaucionSection {...caucion} />} />

      {/* Orden fijo: para cambiarlo, mover estos bloques de lugar. */}
      <main className="grid min-w-0 flex-1 grid-cols-1 items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <PanelSection
          title="Panel Líder"
          description="Cotizaciones de acciones argentinas vía la API de IOL (invertirOnline)."
          columnaPrecio={columnaPrecio}
          {...panelLider}
        />
        <PanelSection
          title="Bonos soberanos en dólares (MEP)"
          description="Bonares, Globales, Discount, Par y Bonos del Tesoro en USD, liquidación MEP."
          columnaPrecio={columnaPrecio}
          {...bonosDolares}
        />
        <PanelSection
          title="Letras"
          description="LECAPs y LECER del Tesoro Nacional en pesos."
          columnaPrecio={columnaPrecio}
          {...letras}
        />
        <PanelSection
          title="Bonos CER"
          description="Boncer y demás deuda del Tesoro Nacional en pesos ajustada por CER."
          columnaPrecio={columnaPrecio}
          {...bonosCer}
        />
        <PanelSection
          title="CEDEARs principales"
          description="Los CEDEARs más operados del día en Argentina."
          columnaPrecio={columnaPrecio}
          {...cedears}
        />
        <CryptoLivePanel inicial={cryptosIniciales} />
      </main>
    </div>
  );
}
