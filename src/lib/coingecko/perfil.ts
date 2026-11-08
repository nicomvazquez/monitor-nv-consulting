import { coingeckoFetch } from "./client";
import { COINGECKO_ID_POR_SIMBOLO, REVALIDATE_SECONDS_COINGECKO } from "./config";
import type { CoinGeckoMarketChart, CoinGeckoMoneda } from "./types";
import type { PuntoPrecio } from "@/lib/types";

export interface PerfilCripto {
  simbolo: string;
  nombre: string;
  imagen: string;
  descripcion: string;
  sitioWeb: string | null;
  categorias: string[];
  fechaGenesis: string | null;
  algoritmo: string | null;
  rankingMarketCap: number | null;
  precioActual: number;
  marketCap: number;
  variacionMarketCap24h: number;
  valuacionDiluida: number;
  volumen24h: number;
  maximo24h: number;
  minimo24h: number;
  variacion24h: number;
  variacion7d: number;
  variacion14d: number;
  variacion30d: number;
  variacion60d: number;
  variacion200d: number;
  variacion1y: number;
  supplyCirculante: number;
  supplyTotal: number | null;
  supplyMaximo: number | null;
  maximoHistorico: number;
  fechaMaximoHistorico: string;
  variacionDesdeMaximo: number;
  minimoHistorico: number;
  fechaMinimoHistorico: string;
  sentimientoPositivo: number | null;
  usuariosEnWatchlist: number | null;
}

/** Módulos de CoinGecko que no se usan acá, apagados a propósito: menos payload por pedido. */
const QUERY_COIN = "localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

/**
 * Perfil de análisis de una moneda: market cap, supply, ATH/ATL, variación en
 * varios plazos y descripción — el equivalente cripto de los fundamentals de
 * Yahoo Finance para acciones. `simbolo` tiene que estar en
 * `COINGECKO_ID_POR_SIMBOLO` (las mismas monedas que ya mostramos vía
 * Binance); si no, devuelve `null` sin pedir nada.
 */
export async function getPerfilCripto(simbolo: string): Promise<PerfilCripto | null> {
  const id = COINGECKO_ID_POR_SIMBOLO[simbolo as keyof typeof COINGECKO_ID_POR_SIMBOLO];
  if (!id) return null;

  try {
    const moneda = await coingeckoFetch<CoinGeckoMoneda>(`/coins/${id}?${QUERY_COIN}`, {
      revalidateSeconds: REVALIDATE_SECONDS_COINGECKO,
    });

    const m = moneda.market_data;
    return {
      simbolo,
      nombre: moneda.name,
      imagen: moneda.image.large,
      descripcion: moneda.description.en,
      sitioWeb: moneda.links.homepage.find((url) => url) ?? null,
      categorias: moneda.categories.filter(Boolean),
      fechaGenesis: moneda.genesis_date,
      algoritmo: moneda.hashing_algorithm,
      rankingMarketCap: moneda.market_cap_rank,
      precioActual: m.current_price.usd,
      marketCap: m.market_cap.usd,
      variacionMarketCap24h: m.market_cap_change_percentage_24h,
      valuacionDiluida: m.fully_diluted_valuation.usd,
      volumen24h: m.total_volume.usd,
      maximo24h: m.high_24h.usd,
      minimo24h: m.low_24h.usd,
      variacion24h: m.price_change_percentage_24h,
      variacion7d: m.price_change_percentage_7d,
      variacion14d: m.price_change_percentage_14d,
      variacion30d: m.price_change_percentage_30d,
      variacion60d: m.price_change_percentage_60d,
      variacion200d: m.price_change_percentage_200d,
      variacion1y: m.price_change_percentage_1y,
      supplyCirculante: m.circulating_supply,
      supplyTotal: m.total_supply,
      supplyMaximo: m.max_supply,
      maximoHistorico: m.ath.usd,
      fechaMaximoHistorico: m.ath_date.usd,
      variacionDesdeMaximo: m.ath_change_percentage.usd,
      minimoHistorico: m.atl.usd,
      fechaMinimoHistorico: m.atl_date.usd,
      sentimientoPositivo: moneda.sentiment_votes_up_percentage,
      usuariosEnWatchlist: moneda.watchlist_portfolio_users,
    };
  } catch (cause) {
    console.error(`[coingecko:perfil] ${simbolo}`, cause);
    return null;
  }
}

/** Cierres diarios de los últimos `dias` (180 por defecto, ~6 meses — mismo criterio que `getHistorialPrecio` de Yahoo). */
export async function getHistorialCripto(simbolo: string, dias = 180): Promise<PuntoPrecio[]> {
  const id = COINGECKO_ID_POR_SIMBOLO[simbolo as keyof typeof COINGECKO_ID_POR_SIMBOLO];
  if (!id) return [];

  try {
    const chart = await coingeckoFetch<CoinGeckoMarketChart>(`/coins/${id}/market_chart?vs_currency=usd&days=${dias}&interval=daily`, {
      revalidateSeconds: REVALIDATE_SECONDS_COINGECKO,
    });
    return chart.prices.map(([timestamp, precio]) => ({ fecha: new Date(timestamp).toISOString(), cierre: precio }));
  } catch (cause) {
    console.error(`[coingecko:historial] ${simbolo}`, cause);
    return [];
  }
}
