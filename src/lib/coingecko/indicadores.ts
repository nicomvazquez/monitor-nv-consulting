import { coingeckoFetch } from "./client";
import { COINGECKO_IDS, REVALIDATE_SECONDS_COINGECKO } from "./config";
import type { CoinGeckoMarketItem } from "./types";
import { formatPercent, formatTasa, formatVolumen } from "@/lib/format";
import type { FilaIndicador } from "@/lib/types";

function monto(valor: number): string {
  return `US$ ${formatVolumen(valor)}`;
}

/**
 * La dominancia real (sobre TODO el mercado) necesita `/global`, que en el
 * plan Demo de CoinGecko devuelve 401 (verificado a mano: el mismo header
 * que sí funciona en `/coins/markets` falla ahí) — parece quedar reservado a
 * planes pagos. Como aproximación, se calcula la dominancia dentro de estas
 * 30 monedas (que entre todas son la enorme mayoría del market cap total),
 * así como el market cap y volumen "top 30" en vez de "total del mercado".
 */
async function getMercadoTop30(): Promise<CoinGeckoMarketItem[]> {
  return coingeckoFetch<CoinGeckoMarketItem[]>(
    `/coins/markets?vs_currency=usd&ids=${COINGECKO_IDS.join(",")}&order=market_cap_desc&sparkline=false`,
    { revalidateSeconds: REVALIDATE_SECONDS_COINGECKO },
  );
}

function dominancia(monedas: CoinGeckoMarketItem[], id: string, marketCapTotal: number): number {
  const moneda = monedas.find((m) => m.id === id);
  return moneda ? (moneda.market_cap / marketCapTotal) * 100 : 0;
}

async function fetchIndicadoresMercado(): Promise<FilaIndicador[]> {
  const monedas = await getMercadoTop30();
  const marketCapTotal = monedas.reduce((acc, m) => acc + m.market_cap, 0);
  const volumenTotal = monedas.reduce((acc, m) => acc + m.total_volume, 0);
  const variacionPonderada = monedas.reduce((acc, m) => acc + m.market_cap * m.market_cap_change_percentage_24h, 0) / marketCapTotal;

  return [
    { nombre: "Dominancia BTC", valor: formatTasa(dominancia(monedas, "bitcoin", marketCapTotal)), fecha: "" },
    { nombre: "Dominancia ETH", valor: formatTasa(dominancia(monedas, "ethereum", marketCapTotal)), fecha: "" },
    { nombre: "Market cap (top 30)", valor: monto(marketCapTotal), fecha: "" },
    { nombre: "Variación 24hs (market cap)", valor: formatPercent(variacionPonderada), fecha: "" },
    { nombre: "Volumen 24hs (top 30)", valor: monto(volumenTotal), fecha: "" },
  ];
}

interface AlternativeMeRespuesta {
  data: { value: string; value_classification: string; timestamp: string }[];
}

const CLASIFICACION_ES: Record<string, string> = {
  "Extreme Fear": "Miedo extremo",
  Fear: "Miedo",
  Neutral: "Neutral",
  Greed: "Codicia",
  "Extreme Greed": "Codicia extrema",
};

/** Fear & Greed Index (alternative.me): encuesta de sentimiento de todo el mercado cripto, no solo de estas 30 monedas — gratis, sin API key. */
async function fetchFearGreed(): Promise<FilaIndicador | null> {
  try {
    const response = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
      next: { revalidate: REVALIDATE_SECONDS_COINGECKO },
    });
    if (!response.ok) return null;

    const { data } = (await response.json()) as AlternativeMeRespuesta;
    const punto = data[0];
    if (!punto) return null;

    const fecha = new Date(Number(punto.timestamp) * 1000).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const clasificacion = CLASIFICACION_ES[punto.value_classification] ?? punto.value_classification;
    return { nombre: "Fear & Greed Index", valor: `${punto.value} (${clasificacion})`, fecha };
  } catch (cause) {
    console.error("[fear-greed]", cause);
    return null;
  }
}

/** Indicadores generales del mercado cripto (no de una moneda en particular) — ver `/cripto`. */
export async function getIndicadoresCripto(): Promise<{ indicadores: FilaIndicador[]; error: string | null }> {
  const [mercado, fearGreed] = await Promise.all([
    fetchIndicadoresMercado().catch((cause) => {
      console.error("[indicadores-cripto]", cause);
      return null;
    }),
    fetchFearGreed(),
  ]);

  const indicadores = [...(fearGreed ? [fearGreed] : []), ...(mercado ?? [])];
  return {
    indicadores,
    error: mercado === null && fearGreed === null ? "No se pudieron cargar los indicadores." : null,
  };
}
