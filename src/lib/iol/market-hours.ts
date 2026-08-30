import { REVALIDATE_SECONDS_MERCADO_ABIERTO, REVALIDATE_SECONDS_MERCADO_CERRADO } from "./config";

const MARKET_TIMEZONE = "America/Argentina/Buenos_Aires";
const MARKET_OPEN_HOUR = 11;
const MARKET_CLOSE_HOUR = 17;

/**
 * Aproximación simple del horario de rueda de BYMA (lun-vie, 11 a 17hs hora
 * de Buenos Aires). No contempla feriados: en un feriado va a decir
 * "abierto" y se pedirán algunos datos de más, pero nunca va a decir
 * "cerrado" mientras el mercado esté realmente operando.
 */
export function isMercadoAbierto(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIMEZONE,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);

  const esDiaHabil = weekday !== "Sat" && weekday !== "Sun";
  return esDiaHabil && hour >= MARKET_OPEN_HOUR && hour < MARKET_CLOSE_HOUR;
}

/** Cada cuántos segundos conviene pedir cotizaciones nuevas en este momento. */
export function getRevalidateSeconds(): number {
  return isMercadoAbierto()
    ? REVALIDATE_SECONDS_MERCADO_ABIERTO
    : REVALIDATE_SECONDS_MERCADO_CERRADO;
}
