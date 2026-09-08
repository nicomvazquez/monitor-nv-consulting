export const BINANCE_REST_URL = "https://api.binance.com/api/v3";
export const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

/** Símbolos fijos a mostrar (pedido explícito del usuario, no un ranking). */
export const CRYPTOS_SIMBOLOS = ["BTC", "ETH", "BNB", "XRP", "SOL", "ADA"] as const;

export const CRYPTOS_NOMBRES: Record<(typeof CRYPTOS_SIMBOLOS)[number], string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
  XRP: "XRP",
  SOL: "Solana",
  ADA: "Cardano",
};

/**
 * Solo gobierna qué tan fresca es la carga inicial server-side (el primer
 * pintado, antes de que el WebSocket del cliente empiece a actualizar en
 * vivo) — no hay polling después de eso.
 */
export const REVALIDATE_SECONDS_CRYPTOS = 30;
