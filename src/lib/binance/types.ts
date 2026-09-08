/** Campos usados de cada elemento de GET /ticker/24hr (la respuesta trae más, no listados acá). */
export interface Binance24hrTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

/** Forma del mensaje que llega por el stream combinado `@ticker` de Binance. */
export interface BinanceTickerStreamMessage {
  stream: string;
  data: {
    /** Símbolo, ej. "BTCUSDT". */
    s: string;
    /** Último precio operado. */
    c: string;
    /** Variación porcentual en las últimas 24hs. */
    P: string;
  };
}
