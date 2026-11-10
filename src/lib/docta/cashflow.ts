import { doctaFetchOpcional } from "./client";
import type { DoctaCashflowEntry, DoctaCashflowResponse } from "./types";
import { getCashflowCacheado, guardarCashflow } from "@/lib/db/cashflowBono";

/**
 * Respaldo del cache permanente en base (ver `lib/db/cashflowBono.ts`): si
 * por lo que sea la fila en la base todavía no existe para este ticker en
 * este pedido puntual, igual conviene no pegarle a Docta de nuevo dentro del
 * mismo día — por eso el `doctaFetchOpcional` de acá abajo sigue cacheado
 * 24hs del lado de Next. En el camino feliz (ya está en la base) esto ni se
 * llega a ejecutar.
 */
const REVALIDATE_SECONDS_CASHFLOW = 60 * 60 * 24;

/**
 * El universo de bonos trae tickers con sufijo de liquidación como
 * instrumentos propios (AL30D/AL30C: mismo bono, precio y moneda de
 * liquidación distintos — ver el comentario de `SUFIJO_DOLAR_MEP` en
 * `lib/iol/config.ts`), pero el cronograma de pagos es el del bono
 * subyacente. Se guarda siempre con la clave SIN sufijo (el ticker base):
 * así, una vez cacheado para "AL30", tanto "AL30D" como "AL30C" pegan en el
 * mismo cache sin pedir nada de nuevo.
 */
function tickerSinSufijo(ticker: string): string | null {
  return /[A-Z0-9]{3,}[DC]$/.test(ticker) ? ticker.slice(0, -1) : null;
}

async function fetchCashflowDocta(ticker: string): Promise<DoctaCashflowEntry[]> {
  const directo = await doctaFetchOpcional<DoctaCashflowResponse>(
    `/api/v1/bonds/analytics/${encodeURIComponent(ticker)}/cashflow`,
    { revalidateSeconds: REVALIDATE_SECONDS_CASHFLOW },
  );
  if (directo) return directo.data;

  const sinSufijo = tickerSinSufijo(ticker);
  if (sinSufijo) {
    const alternativo = await doctaFetchOpcional<DoctaCashflowResponse>(
      `/api/v1/bonds/analytics/${encodeURIComponent(sinSufijo)}/cashflow`,
      { revalidateSeconds: REVALIDATE_SECONDS_CASHFLOW },
    );
    if (alternativo) return alternativo.data;
  }

  return [];
}

/**
 * Primero mira la base propia (permanente, `CashflowBono` — ver
 * `lib/db/cashflowBono.ts`); solo si no está ahí le pide a Docta y guarda el
 * resultado para la próxima. Es la función que arma, visita a visita, la
 * base de bonos propia que pidió el usuario — no hace falta volver a tocar
 * esto para que eso pase, es automático en cada ticker nuevo que alguien
 * elige en la calculadora.
 */
export async function getCashflowBono(ticker: string): Promise<DoctaCashflowEntry[]> {
  const claveBase = tickerSinSufijo(ticker) ?? ticker;
  const clavesAProbar = claveBase === ticker ? [ticker] : [ticker, claveBase];

  for (const clave of clavesAProbar) {
    const cacheado = await getCashflowCacheado(clave);
    if (cacheado) return cacheado;
  }

  const datos = await fetchCashflowDocta(ticker);
  if (datos.length > 0) await guardarCashflow(claveBase, datos);
  return datos;
}
