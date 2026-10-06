import { getFeriados } from "@/lib/argentinadatos/feriados";
import { REVALIDATE_SECONDS_MERCADO_ABIERTO, REVALIDATE_SECONDS_MERCADO_CERRADO } from "./config";

const MARKET_TIMEZONE = "America/Argentina/Buenos_Aires";
const MARKET_OPEN_HOUR = 11;
const MARKET_CLOSE_HOUR = 17;

function partesFecha(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MARKET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const valor = (tipo: string) => parts.find((part) => part.type === tipo)?.value ?? "";
  return {
    weekday: valor("weekday"),
    hour: Number(valor("hour")),
    anio: Number(valor("year")),
    fechaISO: `${valor("year")}-${valor("month")}-${valor("day")}`,
  };
}

/**
 * Feriados del año pedido más el anterior, en un solo Set: cubre con un solo
 * pedido (cacheado) cualquier recorrido hacia atrás que haga
 * `getFechaUltimoCierre` sin tener que pedir por día, incluso cruzando el
 * límite de un año (ej. 1/1 mirando para atrás cae en diciembre del año previo).
 */
async function feriadosAlrededorDe(anio: number): Promise<Set<string>> {
  const [actual, anterior] = await Promise.all([getFeriados(anio), getFeriados(anio - 1)]);
  return new Set([...actual, ...anterior]);
}

/**
 * Aproximación del horario de rueda de BYMA (lun-vie, 11 a 17hs hora de
 * Buenos Aires), contemplando feriados nacionales vía ArgentinaDatos
 * (`lib/argentinadatos/feriados.ts`) — antes no los tenía en cuenta y un
 * feriado caído entre semana hacía pensar que el mercado estaba operando.
 * Si el pedido de feriados falla, `getFeriados` devuelve un set vacío y
 * esta función se comporta como antes (solo fin de semana).
 */
export async function isMercadoAbierto(date: Date = new Date()): Promise<boolean> {
  const { weekday, hour, anio, fechaISO } = partesFecha(date);
  const esDiaHabil = weekday !== "Sat" && weekday !== "Sun";
  if (!esDiaHabil) return false;

  const feriados = await feriadosAlrededorDe(anio);
  if (feriados.has(fechaISO)) return false;

  return hour >= MARKET_OPEN_HOUR && hour < MARKET_CLOSE_HOUR;
}

/**
 * Cada cuántos segundos conviene pedir cotizaciones nuevas, a partir del
 * booleano que ya calculó el caller con `isMercadoAbierto()` — evita volver a
 * resolver horario/feriados una segunda vez para lo mismo.
 */
export function revalidateSecondsPara(mercadoAbierto: boolean): number {
  return mercadoAbierto ? REVALIDATE_SECONDS_MERCADO_ABIERTO : REVALIDATE_SECONDS_MERCADO_CERRADO;
}

function esFinDeSemanaUTC(fecha: Date): boolean {
  const dia = fecha.getUTCDay();
  return dia === 0 || dia === 6;
}

/**
 * Fecha (solo calendario, sin hora) del último cierre de rueda ya
 * completado a esta altura: hoy mismo si el mercado ya cerró por hoy, o el
 * último día hábil anterior si todavía no cerró (está operando, es antes
 * de que abra, es fin de semana o es feriado). Se usa para el reporte de
 * cierre en PDF, que siempre muestra el último cierre real, nunca un precio
 * en vivo.
 */
export async function getFechaUltimoCierre(date: Date = new Date()): Promise<Date> {
  const { weekday, hour, anio, fechaISO } = partesFecha(date);
  const feriados = await feriadosAlrededorDe(anio);

  // Fecha "solo calendario" en UTC a medianoche: representa el día hábil en
  // Buenos Aires sin arrastrar hora/zona horaria al resto de los cálculos.
  const [anioFecha, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(anioFecha, mes - 1, dia));

  const yaCerroHoy = weekday !== "Sat" && weekday !== "Sun" && !feriados.has(fechaISO) && hour >= MARKET_CLOSE_HOUR;
  if (yaCerroHoy) return fecha;

  do {
    fecha.setUTCDate(fecha.getUTCDate() - 1);
  } while (esFinDeSemanaUTC(fecha) || feriados.has(fecha.toISOString().slice(0, 10)));

  return fecha;
}
