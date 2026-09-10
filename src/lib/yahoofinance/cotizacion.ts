import { REVALIDATE_SECONDS_YAHOO, YAHOO_CHART_BASE_URL, YAHOO_USER_AGENT } from "./config";
import type { YahooChartResponse } from "./types";
import type { FilaCotizacion } from "@/lib/types";

export interface TickerYahoo {
  ticker: string;
  nombre: string;
}

export async function getCotizacionYahoo({ ticker, nombre }: TickerYahoo): Promise<FilaCotizacion> {
  const response = await fetch(`${YAHOO_CHART_BASE_URL}/${encodeURIComponent(ticker)}?interval=1d&range=1d`, {
    headers: { "User-Agent": YAHOO_USER_AGENT },
    next: { revalidate: REVALIDATE_SECONDS_YAHOO },
  });

  if (!response.ok) {
    throw new Error(`Pedido a Yahoo Finance falló para ${ticker} (${response.status} ${response.statusText})`);
  }

  const data = (await response.json()) as YahooChartResponse;
  const meta = data.chart.result?.[0]?.meta;
  if (!meta) throw new Error(`Yahoo Finance no devolvió datos para ${ticker}`);

  return {
    simbolo: nombre,
    descripcion: meta.longName ?? meta.shortName ?? nombre,
    ultimoPrecio: meta.regularMarketPrice,
    variacionPorcentual: meta.regularMarketChangePercent ?? null,
  };
}

/**
 * Un pedido por símbolo, no uno solo para todos: `/v7/finance/quote` (el
 * endpoint que traía varios juntos) ahora exige autenticación. Si alguno
 * falla no tira abajo a los demás — solo ese símbolo queda afuera de la
 * lista; recién si fallan *todos* se considera que el panel entero falló.
 */
export async function getCotizacionesYahoo(
  lista: readonly TickerYahoo[],
  etiquetaGrupo: string,
): Promise<FilaCotizacion[]> {
  const resultados = await Promise.allSettled(lista.map(getCotizacionYahoo));
  const filas = resultados
    .filter((resultado): resultado is PromiseFulfilledResult<FilaCotizacion> => resultado.status === "fulfilled")
    .map((resultado) => resultado.value);

  if (filas.length === 0) {
    throw new Error(`No se pudo obtener ningún/a ${etiquetaGrupo} desde Yahoo Finance.`);
  }

  return filas;
}
