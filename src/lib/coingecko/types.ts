/**
 * Formas reales (verificadas a mano contra la API) de las respuestas que usa
 * este módulo. Solo los campos que de verdad se usan — CoinGecko devuelve
 * muchísimos más (tickers, plataformas, etc.) que acá ni se piden
 * (`?tickers=false`). `community_data`/`developer_data` se piden siempre en
 * `false`: verificado a mano que, aun pidiéndolos en `true`, la API no los
 * devuelve (ni community_score, ni stats de GitHub) — parecen reservados a
 * un plan pago, así que no tiene sentido tipar campos que nunca llegan.
 */

/** Cada precio/monto viene en un objeto por moneda (ej. `{ usd: 77638 }`) — acá solo se usa "usd". */
type EnUsd = { usd: number };

/** GET /coins/{id}?market_data=true&tickers=false&community_data=false&developer_data=false&sparkline=false */
export interface CoinGeckoMoneda {
  id: string;
  symbol: string;
  name: string;
  image: { thumb: string; small: string; large: string };
  description: { en: string };
  links: { homepage: string[] };
  /** "2009-01-03" para Bitcoin — `null` en monedas que CoinGecko no tiene cargada esta fecha (ej. XRP, Solana). */
  genesis_date: string | null;
  /** "SHA-256", "Ethash", etc. — `null` en las que no son Proof of Work (ej. BNB, XRP, Solana, Cardano). */
  hashing_algorithm: string | null;
  /** Etiquetas temáticas (ej. "Layer 1 (L1)", "Smart Contract Platform") — se muestran las primeras, no la lista completa (puede traer 8+). */
  categories: string[];
  /** Encuesta de sentimiento entre usuarios de CoinGecko — las dos suman 100. */
  sentiment_votes_up_percentage: number | null;
  sentiment_votes_down_percentage: number | null;
  /** Cuántos usuarios de CoinGecko tienen esta moneda en su watchlist/portfolio — proxy de popularidad. */
  watchlist_portfolio_users: number | null;
  market_cap_rank: number | null;
  market_data: {
    current_price: EnUsd;
    market_cap: EnUsd;
    market_cap_change_percentage_24h: number;
    fully_diluted_valuation: EnUsd;
    total_volume: EnUsd;
    high_24h: EnUsd;
    low_24h: EnUsd;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_14d: number;
    price_change_percentage_30d: number;
    price_change_percentage_60d: number;
    price_change_percentage_200d: number;
    price_change_percentage_1y: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: EnUsd;
    ath_date: { usd: string };
    ath_change_percentage: EnUsd;
    atl: EnUsd;
    atl_date: { usd: string };
  };
}

/** GET /coins/{id}/market_chart?vs_currency=usd&days=N&interval=daily — `prices`: pares [timestamp_ms, precio]. */
export interface CoinGeckoMarketChart {
  prices: [number, number][];
}

/** GET /coins/markets?vs_currency=usd&ids=... — un objeto por moneda, sin anidar como `/coins/{id}`. */
export interface CoinGeckoMarketItem {
  id: string;
  symbol: string;
  market_cap: number;
  total_volume: number;
  market_cap_change_percentage_24h: number;
}
