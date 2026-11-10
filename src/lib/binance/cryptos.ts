import { BINANCE_REST_URL, CRYPTOS_NOMBRES, CRYPTOS_SIMBOLOS, REVALIDATE_SECONDS_CRYPTOS } from "./config";
import type { Binance24hrTicker, CriptoCompleta } from "./types";
import type { FilaCotizacion } from "@/lib/types";

async function fetchTickerIndividual(symbol: string): Promise<Binance24hrTicker | null> {
  try {
    const response = await fetch(`${BINANCE_REST_URL}/ticker/24hr?symbol=${symbol}`, { next: { revalidate: REVALIDATE_SECONDS_CRYPTOS } });
    if (!response.ok) return null;
    return (await response.json()) as Binance24hrTicker;
  } catch {
    return null;
  }
}

/**
 * Pedido compartido: el Data Cache de Next dedupea por URL, así que el panel
 * chico de la home y la tabla completa de `/criptomonedas` no duplican el
 * pedido a Binance.
 *
 * El endpoint multi-símbolo rechaza el pedido ENTERO (400) si uno solo de
 * los 30 dejara de ser un par válido contra USDT (ej. alguien lo deslistea)
 * — verificado a mano. Sin este fallback, esa única baja vaciaría las 30
 * filas en vez de solo la suya; acá se pide cada símbolo por separado y se
 * descartan en silencio los que fallen, así el resto sigue mostrando datos.
 */
async function fetchTickers(): Promise<Binance24hrTicker[] | null> {
  const symbols = CRYPTOS_SIMBOLOS.map((simbolo) => `${simbolo}USDT`);

  try {
    const url = `${BINANCE_REST_URL}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS_CRYPTOS } });
    if (response.ok) return (await response.json()) as Binance24hrTicker[];
    console.error(`[binance] pedido en lote falló: ${response.status} ${response.statusText}`);
  } catch (cause) {
    console.error("[binance] pedido en lote falló", cause);
  }

  const individuales = await Promise.all(symbols.map(fetchTickerIndividual));
  const tickers = individuales.filter((t): t is Binance24hrTicker => t !== null);
  if (tickers.length === 0) console.error("[binance] también falló el fallback símbolo por símbolo: 0 de " + symbols.length + " resultaron");
  return tickers.length > 0 ? tickers : null;
}

/**
 * Solo la foto inicial para el primer pintado del servidor: el panel chico
 * de la home es client-side y se actualiza en vivo por WebSocket apenas
 * monta (ver `components/cryptos/CryptoLivePanel.tsx`), así que esto nunca
 * tira error — si el pedido falla, se devuelven filas vacías y el WebSocket
 * las termina completando.
 */
export async function getCryptosIniciales(): Promise<FilaCotizacion[]> {
  const tickers = await fetchTickers();

  return CRYPTOS_SIMBOLOS.map((simbolo) => {
    const ticker = tickers?.find((t) => t.symbol === `${simbolo}USDT`);
    return {
      simbolo,
      descripcion: CRYPTOS_NOMBRES[simbolo],
      ultimoPrecio: ticker ? Number(ticker.lastPrice) : null,
      variacionPorcentual: ticker ? Number(ticker.priceChangePercent) : null,
      volumen: ticker ? Number(ticker.quoteVolume) : null,
    };
  });
}

function aCriptoCompleta(simbolo: string, ticker: Binance24hrTicker | undefined): CriptoCompleta {
  if (!ticker) {
    return {
      simbolo,
      descripcion: CRYPTOS_NOMBRES[simbolo as keyof typeof CRYPTOS_NOMBRES],
      ultimoPrecio: null,
      variacionPorcentual: null,
      apertura: null,
      maximo: null,
      minimo: null,
      cierreAnterior: null,
      volumen: null,
      cantidadOperaciones: null,
      puntas: null,
    };
  }

  return {
    simbolo,
    descripcion: CRYPTOS_NOMBRES[simbolo as keyof typeof CRYPTOS_NOMBRES],
    ultimoPrecio: Number(ticker.lastPrice),
    variacionPorcentual: Number(ticker.priceChangePercent),
    apertura: Number(ticker.openPrice),
    maximo: Number(ticker.highPrice),
    minimo: Number(ticker.lowPrice),
    cierreAnterior: Number(ticker.prevClosePrice),
    volumen: Number(ticker.quoteVolume),
    cantidadOperaciones: ticker.count,
    puntas: {
      precioCompra: Number(ticker.bidPrice),
      cantidadCompra: Number(ticker.bidQty),
      precioVenta: Number(ticker.askPrice),
      cantidadVenta: Number(ticker.askQty),
    },
  };
}

/** Foto inicial "con todos los datos posibles" para la tabla completa de `/criptomonedas` (ver `components/cryptos/CriptoCompletaLivePanel.tsx`). */
export async function getCryptosCompletas(): Promise<CriptoCompleta[]> {
  const tickers = await fetchTickers();
  return CRYPTOS_SIMBOLOS.map((simbolo) => aCriptoCompleta(simbolo, tickers?.find((t) => t.symbol === `${simbolo}USDT`)));
}
