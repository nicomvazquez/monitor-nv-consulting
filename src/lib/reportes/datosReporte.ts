import { getRiesgoPais } from "@/lib/argentinadatos/riesgoPais";
import type { RiesgoPais } from "@/lib/argentinadatos/types";
import { getIndicadoresMacro } from "@/lib/bcra/macro";
import type { BcraVariable } from "@/lib/bcra/types";
import { getCryptosIniciales } from "@/lib/binance/cryptos";
import { getDolares } from "@/lib/dolarapi/dolares";
import type { Dolar } from "@/lib/dolarapi/types";
import { getIndicadoresMacroUsa } from "@/lib/fred/macro";
import { getCaucionesTabla } from "@/lib/iol/caucion";
import {
  getBonosCer,
  getBonosSoberanosDolaresMep,
  getCedearsPrincipales,
  getLetras,
  getPanelLider,
} from "@/lib/iol/cotizaciones";
import { getFechaUltimoCierre } from "@/lib/iol/market-hours";
import type { FilaCotizacion, FilaIndicador } from "@/lib/types";
import { getCommodities } from "@/lib/yahoofinance/commodities";
import { getIndicesAmericanos } from "@/lib/yahoofinance/indices";
import { getVix } from "@/lib/yahoofinance/vix";

export interface Resultado<T> {
  datos: T | null;
  error: string | null;
}

export interface DatosReporte {
  generadoEn: Date;
  /** Fecha (solo calendario) del último cierre de rueda de BYMA reflejado en el reporte — ver `getFechaUltimoCierre`. */
  fechaCierre: Date;
  dolares: Resultado<Dolar[]>;
  caucion: Resultado<FilaCotizacion[]>;
  riesgoPais: Resultado<RiesgoPais>;
  macroAr: Resultado<BcraVariable[]>;
  vix: Resultado<FilaIndicador>;
  macroUsa: Resultado<FilaIndicador[]>;
  panelLider: Resultado<FilaCotizacion[]>;
  bonosMep: Resultado<FilaCotizacion[]>;
  letras: Resultado<FilaCotizacion[]>;
  bonosCer: Resultado<FilaCotizacion[]>;
  cedears: Resultado<FilaCotizacion[]>;
  indices: Resultado<FilaCotizacion[]>;
  commodities: Resultado<FilaCotizacion[]>;
  criptos: Resultado<FilaCotizacion[]>;
}

async function resolver<T>(panel: string, fetcher: () => Promise<T>): Promise<Resultado<T>> {
  try {
    return { datos: await fetcher(), error: null };
  } catch (cause) {
    console.error(`[reporte-cierre:${panel}]`, cause);
    return { datos: null, error: "No se pudo obtener este dato." };
  }
}

/**
 * Junta, en paralelo, los mismos datos que muestra la home, reutilizando los
 * mismos fetchers (con el mismo ISR que ya usa el resto del sitio) — pero
 * pidiéndoles siempre el modo "cierre": el reporte tiene que reflejar el
 * último cierre real de mercado, nunca un precio en vivo, sin importar la
 * hora a la que se genere (ver `ModoPrecio` en `lib/types.ts`).
 */
export async function getDatosReporte(): Promise<DatosReporte> {
  const [
    fechaCierre,
    dolares,
    caucion,
    riesgoPais,
    macroAr,
    vix,
    macroUsa,
    panelLider,
    bonosMep,
    letras,
    bonosCer,
    cedears,
    indices,
    commodities,
    criptos,
  ] = await Promise.all([
    getFechaUltimoCierre(),
    resolver("dolares", getDolares),
    resolver("caucion", getCaucionesTabla),
    resolver("riesgo-pais", getRiesgoPais),
    resolver("macro-ar", getIndicadoresMacro),
    resolver("vix", () => getVix("cierre")),
    resolver("macro-usa", getIndicadoresMacroUsa),
    resolver("panel-lider", () => getPanelLider("cierre")),
    resolver("bonos-mep", () => getBonosSoberanosDolaresMep("cierre")),
    resolver("letras", () => getLetras("cierre")),
    resolver("bonos-cer", () => getBonosCer("cierre")),
    resolver("cedears", () => getCedearsPrincipales("cierre")),
    resolver("indices", () => getIndicesAmericanos("cierre")),
    resolver("commodities", () => getCommodities("cierre")),
    resolver("criptos", getCryptosIniciales),
  ]);

  return {
    generadoEn: new Date(),
    fechaCierre,
    dolares,
    caucion,
    riesgoPais,
    macroAr,
    vix,
    macroUsa,
    panelLider,
    bonosMep,
    letras,
    bonosCer,
    cedears,
    indices,
    commodities,
    criptos,
  };
}
