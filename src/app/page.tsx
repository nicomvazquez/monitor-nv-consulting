import { CryptoLivePanel } from "@/components/cryptos/CryptoLivePanel";
import { CarruselNoticias } from "@/components/noticias/CarruselNoticias";
import type { NoticiaListado } from "@/components/noticias/ListadoNoticias";
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
import { getNoticiasSemana } from "@/lib/noticias/googleNews";
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

const MAX_DESTACADAS = 10;

async function fetchNoticiasDestacadas() {
  try {
    const noticias = await getNoticiasSemana();
    // Las más cubiertas primero (varios medios publican el mismo hecho); a igual cobertura, las más recientes.
    const destacadas = [...noticias]
      .sort((a, b) => b.cobertura - a.cobertura || b.fecha.getTime() - a.fecha.getTime())
      .slice(0, MAX_DESTACADAS)
      .map<NoticiaListado>((n) => ({
        titulo: n.titulo,
        medio: n.medio,
        url: n.url,
        fecha: n.fecha.toISOString(),
        cobertura: n.cobertura,
      }));
    return { noticiasDestacadas: destacadas, noticiasError: null as string | null };
  } catch (cause) {
    logError("noticias-destacadas", cause);
    return {
      noticiasDestacadas: null,
      noticiasError: "No se pudieron cargar las noticias destacadas. Probá recargar la página en unos minutos.",
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
    noticias,
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
    fetchNoticiasDestacadas(),
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
    <>
    {(noticias.noticiasDestacadas || noticias.noticiasError) && (
      <div className="mx-auto w-full max-w-[100rem] px-6 max-sm:px-2 pt-3 sm:pt-5">
        {noticias.noticiasDestacadas ? (
          noticias.noticiasDestacadas.length > 0 && <CarruselNoticias noticias={noticias.noticiasDestacadas} />
        ) : (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {noticias.noticiasError}
          </p>
        )}
      </div>
    )}

      <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-3 px-6 max-sm:px-2 py-5 max-sm:py-2 lg:flex-row lg:items-start">
        {/* Único <h1> de la home: oculto visualmente porque el dashboard no necesita un
            título grande arriba de todo, pero tiene que existir para accesibilidad/SEO. */}
        <h1 className="sr-only">Cotizaciones del mercado argentino y global en vivo</h1>

        <Sidebar {...macro} {...riesgoPais} {...macroUsa} {...vix} />

        {/* Orden fijo: para cambiarlo, mover estos bloques de lugar. Columnas CSS (no grid): cada
            panel mide lo que necesita su contenido (ver `max-h` en CotizacionesTable), así que un
            panel corto no deja hueco al lado de uno largo — el siguiente panel sube a ocupar ese
            espacio, como en un muro de Pinterest. `break-inside-avoid` evita que un panel se parta
            entre dos columnas. */}
        <main className="min-w-0 flex-1 columns-2 gap-3 sm:gap-5 xl:columns-3">
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection title="Panel Líder" columnaPrecio={columnaPrecio} {...panelLider} />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="Caución"
              columnaPrecio="TNA"
              {...caucion}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="Bonos soberanos en dólares (MEP)"
              columnaPrecio={columnaPrecio}
              {...bonosDolares}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="Letras"
              columnaPrecio={columnaPrecio}
              {...letras}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="Bonos CER"
              columnaPrecio={columnaPrecio}
              {...bonosCer}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="CEDEARs principales"
              columnaPrecio={columnaPrecio}
              {...cedears}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="Índices americanos"
              columnaPrecio="Último"
              {...indices}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <PanelSection
              title="Commodities"
              columnaPrecio="Último"
              {...commodities}
            />
          </div>
          <div className="mb-3 sm:mb-5 break-inside-avoid">
            <CryptoLivePanel inicial={cryptosIniciales} />
          </div>
        </main>
      </div>
    </>
  );
}
