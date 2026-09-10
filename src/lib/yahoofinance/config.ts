export const YAHOO_CHART_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

/**
 * Yahoo devuelve 429 sin un User-Agent de navegador (verificado a mano: el
 * default de `fetch`/`curl` queda bloqueado, uno de Chrome no). No hace
 * falta nada más — sin API key, sin cookies, sin "crumb".
 */
export const YAHOO_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Tickers de Yahoo Finance para los principales índices americanos.
 * Verificado a mano contra la API real: `/v7/finance/quote` (que trae
 * varios símbolos en un solo pedido) ahora exige autenticación, así que se
 * pide cada uno por separado contra `/v8/finance/chart/{ticker}`.
 */
export const INDICES_AMERICANOS = [
  { ticker: "^GSPC", nombre: "S&P 500" },
  { ticker: "^DJI", nombre: "Dow Jones" },
  { ticker: "^IXIC", nombre: "Nasdaq Composite" },
  { ticker: "^RUT", nombre: "Russell 2000" },
] as const;

/** Vive en el panel de indicadores macro de EE.UU. (no en "Índices americanos"): es un gauge de riesgo, no un índice bursátil. */
export const VIX = { ticker: "^VIX", nombre: "VIX" } as const;

/**
 * Futuros de Yahoo Finance (sufijo "=F"). Oro y petróleo como referencia
 * general, y los tres granos de mayor peso en las exportaciones argentinas
 * (soja, maíz, trigo) en vez de una selección genérica de commodities.
 */
export const COMMODITIES = [
  { ticker: "GC=F", nombre: "Oro" },
  { ticker: "CL=F", nombre: "Petróleo WTI" },
  { ticker: "ZS=F", nombre: "Soja" },
  { ticker: "ZC=F", nombre: "Maíz" },
  { ticker: "ZW=F", nombre: "Trigo" },
] as const;

/** Cada cuántos segundos se revalida cualquier cotización de Yahoo Finance (índices y commodities). */
export const REVALIDATE_SECONDS_YAHOO = 5 * 60;
