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
import { getIndicadoresMacroUsa } from "@/lib/fred/macro";
import { getCommodities } from "@/lib/yahoofinance/commodities";
import { getIndicesAmericanos } from "@/lib/yahoofinance/indices";
import { getVix } from "@/lib/yahoofinance/vix";
import type { FilaCotizacion } from "@/lib/types";

/**
 * El detalle técnico real (status HTTP, símbolo que falló, etc.) se loguea
 * server-side para poder debuggear — mostrárselo al visitante no tiene
 * sentido, no es algo que pueda accionar. La UI siempre muestra un mensaje
 * genérico y amigable, con el nombre del panel como tag en el log.
 */
function logError(panel: string, cause: unknown) {
  console.error(`[${panel}]`, cause);
}

const ERROR_PANEL = "No se pudieron cargar los datos de este panel. Probá recargar la página en unos minutos.";

async function fetchPanel(panel: string, fetcher: () => Promise<FilaCotizacion[]>) {
  try {
    return { items: await fetcher(), error: null as string | null };
  } catch (cause) {
    logError(panel, cause);
    return { items: null, error: ERROR_PANEL };
  }
}

async function fetchYahoo(panel: string, fetcher: () => Promise<FilaCotizacion[]>) {
  try {
    return { items: await fetcher(), error: null as string | null };
  } catch (cause) {
    logError(panel, cause);
    return { items: null, error: ERROR_PANEL };
  }
}

async function fetchMacro() {
  try {
    return { indicadores: await getIndicadoresMacro(), error: null as string | null };
  } catch (cause) {
    logError("macro-bcra", cause);
    return {
      indicadores: null,
      error: "No se pudieron cargar los indicadores macro. Probá recargar la página en unos minutos.",
    };
  }
}

async function fetchRiesgoPais() {
  try {
    return { riesgoPais: await getRiesgoPais(), riesgoPaisError: null as string | null };
  } catch (cause) {
    logError("riesgo-pais", cause);
    return {
      riesgoPais: null,
      riesgoPaisError: "No se pudo cargar el riesgo país. Probá recargar la página en unos minutos.",
    };
  }
}

async function fetchMacroUsa() {
  try {
    return { indicadoresUsa: await getIndicadoresMacroUsa(), errorUsa: null as string | null };
  } catch (cause) {
    logError("macro-usa", cause);
    return {
      indicadoresUsa: null,
      errorUsa: "No se pudieron cargar los indicadores macro de EE.UU. Probá recargar la página en unos minutos.",
    };
  }
}

async function fetchVix() {
  try {
    return { vix: await getVix(), vixError: null as string | null };
  } catch (cause) {
    logError("vix", cause);
    return { vix: null, vixError: "No se pudo cargar el VIX. Probá recargar la página en unos minutos." };
  }
}

export default async function HomePage() {
  const [
    macro,
    riesgoPais,
    macroUsa,
    vix,
    cryptosIniciales,
    caucion,
    panelLider,
    cedears,
    bonosDolares,
    letras,
    bonosCer,
    indices,
    commodities,
  ] = await Promise.all([
    fetchMacro(),
    fetchRiesgoPais(),
    fetchMacroUsa(),
    fetchVix(),
    getCryptosIniciales(),
    fetchPanel("caucion", getCaucionesTabla),
    fetchPanel("panel-lider", getPanelLider),
    fetchPanel("cedears", getCedearsPrincipales),
    fetchPanel("bonos-mep", getBonosSoberanosDolaresMep),
    fetchPanel("letras", getLetras),
    fetchPanel("bonos-cer", getBonosCer),
    fetchYahoo("indices-americanos", getIndicesAmericanos),
    fetchYahoo("commodities", getCommodities),
  ]);

  const columnaPrecio = (await isMercadoAbierto()) ? "Último" : "Cierre";

  return (
    <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 px-6 py-5 lg:flex-row lg:items-start">
      {/* Único <h1> de la home: oculto visualmente porque el dashboard no necesita un
          título grande arriba de todo, pero tiene que existir para accesibilidad/SEO. */}
      <h1 className="sr-only">Cotizaciones del mercado argentino y global en vivo</h1>

      <Sidebar
        {...macro}
        {...riesgoPais}
        {...macroUsa}
        {...vix}
        caucion={<CaucionSection {...caucion} />}
      />

      {/* Orden fijo: para cambiarlo, mover estos bloques de lugar. Columnas CSS (no grid): cada
          panel mide lo que necesita su contenido (ver `max-h` en CotizacionesTable), así que un
          panel corto no deja hueco al lado de uno largo — el siguiente panel sube a ocupar ese
          espacio, como en un muro de Pinterest. `break-inside-avoid` evita que un panel se parta
          entre dos columnas. */}
      <main className="min-w-0 flex-1 columns-1 gap-5 sm:columns-2 xl:columns-3">
        <div className="mb-5 break-inside-avoid">
          <PanelSection title="Panel Líder" columnaPrecio={columnaPrecio} {...panelLider} />
        </div>
        <div className="mb-5 break-inside-avoid">
          <PanelSection
            title="Bonos soberanos en dólares (MEP)"
            description="Bonares, Globales, Discount, Par y Bonos del Tesoro."
            columnaPrecio={columnaPrecio}
            {...bonosDolares}
          />
        </div>
        <div className="mb-5 break-inside-avoid">
          <PanelSection
            title="Letras"
            description="LECAPs y LECER del Tesoro en pesos."
            columnaPrecio={columnaPrecio}
            {...letras}
          />
        </div>
        <div className="mb-5 break-inside-avoid">
          <PanelSection
            title="Bonos CER"
            description="Deuda del Tesoro en pesos ajustada por CER."
            columnaPrecio={columnaPrecio}
            {...bonosCer}
          />
        </div>
        <div className="mb-5 break-inside-avoid">
          <PanelSection
            title="CEDEARs principales"
            description="Los más operados del día."
            columnaPrecio={columnaPrecio}
            {...cedears}
          />
        </div>
        <div className="mb-5 break-inside-avoid">
          <PanelSection
            title="Índices americanos"
            description="S&P 500, Dow Jones, Nasdaq y Russell 2000."
            columnaPrecio="Último"
            {...indices}
          />
        </div>
        <div className="mb-5 break-inside-avoid">
          <PanelSection
            title="Commodities"
            description="Oro, petróleo WTI, soja, maíz y trigo."
            columnaPrecio="Último"
            {...commodities}
          />
        </div>
        <div className="mb-5 break-inside-avoid">
          <CryptoLivePanel inicial={cryptosIniciales} />
        </div>
      </main>
    </div>
  );
}
