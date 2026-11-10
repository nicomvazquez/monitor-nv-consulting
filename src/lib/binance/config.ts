export const BINANCE_REST_URL = "https://api.binance.com/api/v3";
export const BINANCE_WS_URL = "wss://stream.binance.com:9443/stream";

/**
 * Binance devuelve 451 (bloqueo geográfico) a los pedidos que salen de IPs de
 * EE.UU. — comprobado que era justo el caso de este sitio en producción:
 * Vercel usa la región "iad1" (EE.UU.) por defecto si no se la fija, y de
 * ahí salía el `fetch` de este módulo. Por eso `vercel.json` fija
 * `"regions": ["gru1"]` (San Pablo): saca el deploy de EE.UU. y de paso
 * acerca la región al resto de las fuentes del sitio (IOL, dolarapi, BCRA),
 * casi todas argentinas.
 */

/**
 * Las 30 más importantes por market cap (verificado a mano contra
 * `/coins/markets` de CoinGecko, ordenado por `market_cap_desc`), filtrando
 * stablecoins/tokens que trackean USD u oro (no son "criptomonedas" en el
 * sentido que importa acá) y quedándose solo con las que de verdad cotizan
 * contra USDT en Binance (fuente del precio en vivo). Lista fija, no un
 * ranking que se recalcule solo: igual que antes, se actualiza a mano si
 * hace falta.
 */
export const CRYPTOS_SIMBOLOS = [
  "BTC",
  "ETH",
  "BNB",
  "XRP",
  "SOL",
  "TRX",
  "ZEC",
  "HYPE",
  "DOGE",
  "LINK",
  "ADA",
  "XLM",
  "BCH",
  "NEAR",
  "UNI",
  "LTC",
  "AVAX",
  "SUI",
  "HBAR",
  "QNT",
  "GRAM",
  "SHIB",
  "TAO",
  "PEPE",
  "ENA",
  "AAVE",
  "ONDO",
  "PUMP",
  "ASTER",
  "DOT",
] as const;

export const CRYPTOS_NOMBRES: Record<(typeof CRYPTOS_SIMBOLOS)[number], string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
  XRP: "XRP",
  SOL: "Solana",
  TRX: "TRON",
  ZEC: "Zcash",
  HYPE: "Hyperliquid",
  DOGE: "Dogecoin",
  LINK: "Chainlink",
  ADA: "Cardano",
  XLM: "Stellar",
  BCH: "Bitcoin Cash",
  NEAR: "NEAR Protocol",
  UNI: "Uniswap",
  LTC: "Litecoin",
  AVAX: "Avalanche",
  SUI: "Sui",
  HBAR: "Hedera",
  QNT: "Quant",
  GRAM: "Gram (ex Toncoin)",
  SHIB: "Shiba Inu",
  TAO: "Bittensor",
  PEPE: "Pepe",
  ENA: "Ethena",
  AAVE: "Aave",
  ONDO: "Ondo",
  PUMP: "Pump.fun",
  ASTER: "Aster",
  DOT: "Polkadot",
};

/**
 * Solo gobierna qué tan fresca es la carga inicial server-side (el primer
 * pintado, antes de que el WebSocket del cliente empiece a actualizar en
 * vivo) — no hay polling después de eso.
 */
export const REVALIDATE_SECONDS_CRYPTOS = 30;
