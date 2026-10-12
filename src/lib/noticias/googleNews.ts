import { calcularCobertura, ES_FINANCIERO, parsearRss, type Titular } from "@/lib/reportes/noticias";

const TIMEOUT_MS = 8_000;
const REVALIDATE_SECONDS = 30 * 60;
const VENTANA_DIAS = 7;
const POR_CONSULTA = 15;
/** Cupos finales: pocas noticias, pero de mayor calidad (varios medios cubren el mismo hecho). */
const MAX_MERCADOS = 24;
const MAX_CRIPTO = 8;

/** Solo pasan los titulares de cripto (las búsquedas de Google Noticias traen ruido de otros temas). */
const ES_CRIPTO = /cripto|bitcoin|ethereum|stablecoin|usdt|binance|blockchain|solana|\bxrp\b|\bbtc\b|\beth\b|\btoken/i;

interface Consulta {
  tema: string;
  filtro: RegExp;
  cripto: boolean;
}

/** Búsquedas amplias en Google Noticias (RSS gratuito). Cada una aporta hasta POR_CONSULTA titulares. */
const CONSULTAS: Consulta[] = [
  { tema: "mercados finanzas Argentina", filtro: ES_FINANCIERO, cripto: false },
  { tema: "Merval acciones bonos", filtro: ES_FINANCIERO, cripto: false },
  { tema: "riesgo país bonos argentinos", filtro: ES_FINANCIERO, cripto: false },
  { tema: "dólar BCRA tasas inflación", filtro: ES_FINANCIERO, cripto: false },
  { tema: "economía argentina Caputo", filtro: ES_FINANCIERO, cripto: false },
  { tema: "Wall Street S&P 500 Nasdaq", filtro: ES_FINANCIERO, cripto: false },
  { tema: "Fed tasas bonos Estados Unidos", filtro: ES_FINANCIERO, cripto: false },
  { tema: "petróleo oro commodities mercado", filtro: ES_FINANCIERO, cripto: false },
  { tema: "bitcoin criptomonedas mercado", filtro: ES_CRIPTO, cripto: true },
  { tema: "ethereum stablecoins cripto", filtro: ES_CRIPTO, cripto: true },
  { tema: "cripto Argentina regulación", filtro: ES_CRIPTO, cripto: true },
];

interface Obtenida {
  titular: Titular;
  cripto: boolean;
}

async function noticiasDeConsulta({ tema, filtro, cripto }: Consulta): Promise<Obtenida[]> {
  const consulta = `${tema} when:${VENTANA_DIAS}d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(consulta)}&hl=es-419&gl=AR&ceid=AR:es-419`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`Google Noticias respondió ${response.status} para "${tema}"`);

  return parsearRss(await response.text())
    .filter((titular) => filtro.test(titular.titulo))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    .slice(0, POR_CONSULTA)
    .map((titular) => ({ titular, cripto }));
}

/** Más cubiertas primero (relevancia); a igual cobertura, las más recientes. */
const porRelevancia = (a: Titular, b: Titular) => b.cobertura - a.cobertura || b.fecha.getTime() - a.fecha.getTime();

/**
 * Noticias de mercados, economía y cripto de los últimos 7 días (nunca más viejas:
 * el filtro por fecha se aplica en código además de la consulta `when:7d`).
 * Se muestran solo las más relevantes: primero las que varios medios cubren, con un
 * cupo para mercados y otro para cripto. Cada una trae cuántos medios cubren el mismo hecho.
 * Best-effort por consulta: si una falla, las demás se muestran.
 */
export async function getNoticiasSemana(): Promise<Titular[]> {
  const limite = Date.now() - VENTANA_DIAS * 24 * 60 * 60 * 1000;
  const resultados = await Promise.allSettled(CONSULTAS.map(noticiasDeConsulta));

  const vistos = new Set<string>();
  const obtenidas: Obtenida[] = [];

  for (const resultado of resultados) {
    if (resultado.status === "rejected") {
      console.error("[noticias]", resultado.reason);
      continue;
    }
    for (const obtenida of resultado.value) {
      if (obtenida.titular.fecha.getTime() < limite) continue;
      const clave = obtenida.titular.titulo.toLowerCase().slice(0, 60);
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      obtenidas.push(obtenida);
    }
  }

  // La cobertura se calcula sobre todo el pool: un hecho de mercados también puede estar en cripto.
  const titulares = obtenidas.map((o) => o.titular);
  calcularCobertura(titulares);

  const mercados = obtenidas.filter((o) => !o.cripto).map((o) => o.titular).sort(porRelevancia);
  const cripto = obtenidas.filter((o) => o.cripto).map((o) => o.titular).sort(porRelevancia);

  return [...mercados.slice(0, MAX_MERCADOS), ...cripto.slice(0, MAX_CRIPTO)].sort(
    (a, b) => b.fecha.getTime() - a.fecha.getTime(),
  );
}
