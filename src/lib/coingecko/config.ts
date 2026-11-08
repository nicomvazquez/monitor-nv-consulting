import { CRYPTOS_SIMBOLOS } from "@/lib/binance/config";

export const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Mapea cada símbolo que ya mostramos (los mismos de `binance/config.ts`) al
 * id que usa CoinGecko para identificarlo — no alcanza con el ticker, porque
 * varias monedas distintas comparten símbolo en CoinGecko. Verificado a mano
 * contra `/coins/markets`.
 */
export const COINGECKO_ID_POR_SIMBOLO: Record<(typeof CRYPTOS_SIMBOLOS)[number], string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  XRP: "ripple",
  SOL: "solana",
  ADA: "cardano",
};

/**
 * El market cap, supply y ATH/ATL de una moneda no cambian de un cuarto de
 * hora a otro — a diferencia del precio en vivo (que ya cubre Binance por
 * WebSocket en la tabla), este panel es de "análisis", no de trading.
 */
export const REVALIDATE_SECONDS_COINGECKO = 15 * 60;
