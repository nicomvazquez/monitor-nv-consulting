/** Campos usados de cada elemento de GET /ticker/24hr (la respuesta trae más, no listados acá) — verificado a mano contra la API real. */
export interface Binance24hrTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  /** Cierre del día anterior (no de hace 24hs exactas) — mismo concepto que `ultimoCierre` de IOL. */
  prevClosePrice: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  /** Volumen de las últimas 24hs, en la moneda cotizada (USDT) — más comparable entre monedas que el volumen en unidades. */
  quoteVolume: string;
  /** Cantidad de operaciones en las últimas 24hs. */
  count: number;
}

/** Forma del mensaje que llega por el stream combinado `@ticker` de Binance — mismos campos que `Binance24hrTicker`, en claves de una letra (verificado a mano conectando al stream real). */
export interface BinanceTickerStreamMessage {
  stream: string;
  data: {
    /** Símbolo, ej. "BTCUSDT". */
    s: string;
    /** Último precio operado. */
    c: string;
    /** Variación porcentual en las últimas 24hs. */
    P: string;
    /** Apertura. */
    o: string;
    /** Máximo. */
    h: string;
    /** Mínimo. */
    l: string;
    /** Precio de la primera operación antes de la ventana de 24hs — el equivalente de "cierre anterior". */
    x: string;
    /** Mejor precio de compra (bid) vigente. */
    b: string;
    /** Cantidad de la mejor punta de compra. */
    B: string;
    /** Mejor precio de venta (ask) vigente. */
    a: string;
    /** Cantidad de la mejor punta de venta. */
    A: string;
    /** Volumen de las últimas 24hs, en USDT. */
    q: string;
    /** Cantidad de operaciones en las últimas 24hs. */
    n: number;
  };
}

export interface PuntaCripto {
  precioCompra: number | null;
  cantidadCompra: number | null;
  precioVenta: number | null;
  cantidadVenta: number | null;
}

/**
 * Forma "con todos los datos posibles" de una criptomoneda — el equivalente
 * cripto de `AccionCompleta` (IOL), para la tabla de `/criptomonedas`. A
 * diferencia de IOL, Binance no tiene concepto de "mercado cerrado": el
 * `/ticker/24hr` siempre es sobre las últimas 24hs reales, no la última
 * rueda — por eso no hace falta un `ModoPrecio`.
 */
export interface CriptoCompleta {
  simbolo: string;
  descripcion: string;
  ultimoPrecio: number | null;
  variacionPorcentual: number | null;
  apertura: number | null;
  maximo: number | null;
  minimo: number | null;
  cierreAnterior: number | null;
  volumen: number | null;
  cantidadOperaciones: number | null;
  puntas: PuntaCripto | null;
}
