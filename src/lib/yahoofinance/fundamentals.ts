import YahooFinance from "yahoo-finance2";
import type { QuoteSummaryResult } from "yahoo-finance2/modules/quoteSummary-iface";
import { REVALIDATE_SECONDS_FUNDAMENTALS } from "./config";
import type { PuntoPrecio } from "@/lib/types";

/**
 * Instancia a nivel de módulo (no una por pedido): yahoo-finance2 maneja su
 * propia cookie/"crumb" de sesión con Yahoo internamente, así que reusarla
 * entre pedidos evita renegociar esa sesión cada vez. `suppressNotices`
 * calla un aviso de encuesta que la librería imprime una vez por proceso.
 *
 * `fetch` custom: yahoo-finance2 usa `globalThis.fetch` (el `fetch` que
 * Next.js parchea para cachear) pero nunca pasa `next: { revalidate }` —
 * sin esto, cada pedido queda sin cachear (Next 15+ no cachea `fetch` por
 * default salvo que se pida explícitamente), así que `quoteSummary`/`chart`
 * le pegaban a Yahoo de cero en cada visita a una ficha. Se aplica a nivel
 * de instancia (no solo al pedido de datos) porque también cubre, sin
 * problema, el pedido ocasional de cookie/crumb interno de la librería —
 * ese solo se dispara una vez por proceso (se cachea en memoria aparte,
 * ver `getCrumb` de la librería), así que cachearlo con `fetch` no tiene
 * efecto práctico.
 */
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  fetch: (input, init) => fetch(input, { ...init, next: { revalidate: REVALIDATE_SECONDS_FUNDAMENTALS } }),
});

// No `Awaited<ReturnType<typeof yahooFinance.quoteSummary>>`: ese método está sobrecargado
// (una firma valida y devuelve `QuoteSummaryResult`, la otra no valida y devuelve `unknown`)
// y `ReturnType` sobre una función sobrecargada toma la ÚLTIMA firma — la de `unknown`.
export type Fundamentals = QuoteSummaryResult;

/**
 * `simbolo` es el ticker local de IOL (ej. "GGAL", sin sufijo) — por defecto
 * se le agrega ".BA" para pedirle a Yahoo la versión que cotiza en BYMA, en
 * pesos. `sufijo` se puede pasar vacío (`/acciones-internacionales`: el
 * símbolo del CEDEAR coincide con el ticker de la empresa original, y ahí
 * interesan los fundamentals reales de esa empresa, no los — mucho más
 * flacos — del CEDEAR local) o distinto si hiciera falta en el futuro.
 * Devuelve `null` en vez de tirar si Yahoo no tiene datos para ese símbolo
 * (pasa con algunas acciones chicas del Panel General) o si la validación
 * de esquema de la librería falla para ese ticker puntual.
 *
 * Los módulos de abajo están verificados a mano contra tickers argentinos
 * reales (GGAL.BA, BHIP.BA): todos devuelven datos. Quedan afuera a
 * propósito `earningsHistory` (da errores de validación de esquema en
 * algunos símbolos) y los submódulos de estados contables
 * (`incomeStatementHistory` y similares) — la propia librería avisa que
 * Yahoo los dejó casi vacíos desde noviembre 2024 y recomienda
 * `fundamentalsTimeSeries` en su lugar, un mecanismo distinto (no un módulo
 * más de `quoteSummary`). Lista literal, no una constante aparte: así TS no
 * la infiere como tupla `readonly`, que `quoteSummary` no acepta.
 */
export async function getFundamentals(simbolo: string, sufijo = ".BA"): Promise<Fundamentals | null> {
  try {
    return await yahooFinance.quoteSummary(`${simbolo}${sufijo}`, {
      modules: [
        "summaryDetail",
        "defaultKeyStatistics",
        "financialData",
        "assetProfile",
        "price",
        "earningsTrend",
        "recommendationTrend",
        "calendarEvents",
        "majorHoldersBreakdown",
        "quoteType",
      ],
    });
  } catch (cause) {
    console.error(`[fundamentals] ${simbolo}`, cause);
    return null;
  }
}

/**
 * Cierres diarios de los últimos `meses` (6 por defecto). Mismo sufijo
 * ".BA" que `getFundamentals` (y mismo motivo para pasarlo vacío). Los
 * espaciados de fin de semana no hacen falta — `quotes` ya viene filtrado a
 * solo ruedas con operaciones, así que graficar por índice (no por fecha
 * real) ya da un eje parejo.
 */
export async function getHistorialPrecio(simbolo: string, meses = 6, sufijo = ".BA"): Promise<PuntoPrecio[]> {
  try {
    const hasta = new Date();
    const desde = new Date(hasta);
    desde.setMonth(desde.getMonth() - meses);

    const { quotes } = await yahooFinance.chart(`${simbolo}${sufijo}`, {
      period1: desde,
      period2: hasta,
      interval: "1d",
    });

    const puntos = quotes
      .filter((cotizacion): cotizacion is typeof cotizacion & { close: number } => cotizacion.close !== null && cotizacion.close !== undefined)
      .map((cotizacion) => ({ fecha: cotizacion.date.toISOString(), cierre: cotizacion.close }));

    if (puntos.length === 0) console.error(`[historial-precio] ${simbolo}: yahooFinance.chart devolvió 0 puntos usables`);
    return puntos;
  } catch (cause) {
    console.error(`[historial-precio] ${simbolo}`, cause);
    return [];
  }
}
