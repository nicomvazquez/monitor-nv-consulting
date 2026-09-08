import { BINANCE_REST_URL, CRYPTOS_NOMBRES, CRYPTOS_SIMBOLOS, REVALIDATE_SECONDS_CRYPTOS } from "./config";
import type { Binance24hrTicker } from "./types";
import type { FilaCotizacion } from "@/lib/types";

function filasVacias(): FilaCotizacion[] {
  return CRYPTOS_SIMBOLOS.map((simbolo) => ({
    simbolo,
    descripcion: CRYPTOS_NOMBRES[simbolo],
    ultimoPrecio: null,
    variacionPorcentual: null,
  }));
}

/**
 * Solo la foto inicial para el primer pintado del servidor: el panel es
 * client-side y se actualiza en vivo por WebSocket apenas monta (ver
 * `components/cryptos/CryptoLivePanel.tsx`), así que esto nunca tira error
 * — si el pedido falla, se devuelven filas vacías y el WebSocket las
 * termina completando.
 */
export async function getCryptosIniciales(): Promise<FilaCotizacion[]> {
  try {
    const symbols = CRYPTOS_SIMBOLOS.map((simbolo) => `${simbolo}USDT`);
    const url = `${BINANCE_REST_URL}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
    const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS_CRYPTOS } });

    if (!response.ok) return filasVacias();

    const tickers = (await response.json()) as Binance24hrTicker[];

    return CRYPTOS_SIMBOLOS.map((simbolo) => {
      const ticker = tickers.find((t) => t.symbol === `${simbolo}USDT`);
      return {
        simbolo,
        descripcion: CRYPTOS_NOMBRES[simbolo],
        ultimoPrecio: ticker ? Number(ticker.lastPrice) : null,
        variacionPorcentual: ticker ? Number(ticker.priceChangePercent) : null,
      };
    });
  } catch {
    return filasVacias();
  }
}
