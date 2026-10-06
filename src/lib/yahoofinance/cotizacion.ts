import { REVALIDATE_SECONDS_YAHOO, YAHOO_CHART_BASE_URL, YAHOO_USER_AGENT } from "./config";
import type { YahooChartResponse } from "./types";
import type { FilaCotizacion, ModoPrecio } from "@/lib/types";

export interface TickerYahoo {
  ticker: string;
  nombre: string;
}

export async function getCotizacionYahoo(
  { ticker, nombre }: TickerYahoo,
  modo: ModoPrecio = "auto",
): Promise<FilaCotizacion> {
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

  // `regularMarketPrice` es en vivo mientras el mercado de EE.UU. está
  // operando (`currentTradingPeriod.regular`), y solo pasa a ser un cierre
  // real una vez terminada la sesión. Si se pide "cierre" con el mercado
  // todavía abierto, se usa `chartPreviousClose` (el cierre anterior) en
  // vez de esperar a que termine hoy, y se omite la variación: la que da
  // Yahoo es siempre "vs. el cierre anterior a HOY", así que no le
  // corresponde a un precio que ya es, en sí, el cierre de ayer.
  const ahora = Date.now() / 1000;
  const regular = meta.currentTradingPeriod?.regular;
  const mercadoEnVivo = regular ? ahora >= regular.start && ahora < regular.end : false;
  const cierreAnterior = meta.chartPreviousClose;
  const mostrarCierreAnterior = modo === "cierre" && mercadoEnVivo && cierreAnterior !== undefined;

  return {
    simbolo: nombre,
    descripcion: meta.longName ?? meta.shortName ?? nombre,
    ultimoPrecio: mostrarCierreAnterior ? cierreAnterior : meta.regularMarketPrice,
    variacionPorcentual: mostrarCierreAnterior ? null : (meta.regularMarketChangePercent ?? null),
    volumen: meta.regularMarketVolume ?? null,
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
  modo: ModoPrecio = "auto",
): Promise<FilaCotizacion[]> {
  const resultados = await Promise.allSettled(lista.map((ticker) => getCotizacionYahoo(ticker, modo)));
  const filas = resultados
    .filter((resultado): resultado is PromiseFulfilledResult<FilaCotizacion> => resultado.status === "fulfilled")
    .map((resultado) => resultado.value);

  if (filas.length === 0) {
    throw new Error(`No se pudo obtener ningún/a ${etiquetaGrupo} desde Yahoo Finance.`);
  }

  return filas;
}
