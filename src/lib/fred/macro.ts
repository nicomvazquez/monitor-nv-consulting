import { env } from "@/config/env";
import { formatPrice } from "@/lib/format";
import type { FilaIndicador } from "@/lib/types";
import { FRED_BASE_URL, REVALIDATE_SECONDS_FRED } from "./config";
import type { FredObservationsResponse } from "./types";

interface SerieFred {
  id: string;
  nombre: string;
  /** "pc1": que la propia API de FRED devuelva la variación % interanual, en vez del valor bruto. */
  unidades?: "pc1";
  formatear: (valor: number) => string;
}

/**
 * Espejo del panel de indicadores del BCRA, pero para EE.UU. Series elegidas
 * a mano: tasa de política monetaria, inflación interanual (FRED calcula el
 * % directamente, sin que haga falta derivarlo del índice), desempleo,
 * oferta monetaria M2 (equivalente a "base monetaria") y PBI trimestral.
 */
const SERIES: SerieFred[] = [
  { id: "FEDFUNDS", nombre: "Tasa de la Fed", formatear: (v) => `${formatPrice(v)}%` },
  {
    id: "CPIAUCSL",
    nombre: "Inflación interanual (CPI)",
    unidades: "pc1",
    formatear: (v) => `${formatPrice(v)}%`,
  },
  { id: "UNRATE", nombre: "Desempleo", formatear: (v) => `${formatPrice(v)}%` },
  { id: "M2SL", nombre: "Oferta monetaria (M2)", formatear: (v) => `US$ ${formatPrice(v)} MM` },
  { id: "A191RL1Q225SBEA", nombre: "PBI (trim. anualizado)", formatear: (v) => `${formatPrice(v)}%` },
];

/** "2026-08-01" -> "08/2026": son series mensuales/trimestrales (siempre día 01); mostrar el día sugeriría una precisión que no tienen. */
function formatFechaMensual(fechaIso: string): string {
  const [anio, mes] = fechaIso.split("-");
  return `${mes}/${anio}`;
}

async function getFilaFred(serie: SerieFred): Promise<FilaIndicador> {
  const params = new URLSearchParams({
    series_id: serie.id,
    api_key: env.fredApiKey,
    file_type: "json",
    sort_order: "desc",
    limit: "1",
  });
  if (serie.unidades) params.set("units", serie.unidades);

  const response = await fetch(`${FRED_BASE_URL}?${params.toString()}`, {
    next: { revalidate: REVALIDATE_SECONDS_FRED },
  });

  if (!response.ok) {
    throw new Error(`Pedido a FRED falló para ${serie.id} (${response.status} ${response.statusText})`);
  }

  const data = (await response.json()) as FredObservationsResponse;
  const observacion = data.observations[0];
  // FRED usa "." como valor cuando un período todavía no tiene dato publicado.
  if (!observacion || observacion.value === ".") {
    throw new Error(`FRED no devolvió un dato válido para ${serie.id}`);
  }

  return {
    nombre: serie.nombre,
    valor: serie.formatear(Number(observacion.value)),
    fecha: formatFechaMensual(observacion.date),
  };
}

/**
 * Un pedido por serie: FRED no tiene un endpoint que traiga varias juntas.
 * Si alguna falla no tira abajo a las demás — recién si fallan todas se
 * considera que el panel entero falló (mismo criterio que Yahoo Finance).
 */
export async function getIndicadoresMacroUsa(): Promise<FilaIndicador[]> {
  const resultados = await Promise.allSettled(SERIES.map(getFilaFred));
  const filas = resultados
    .filter((resultado): resultado is PromiseFulfilledResult<FilaIndicador> => resultado.status === "fulfilled")
    .map((resultado) => resultado.value);

  if (filas.length === 0) {
    throw new Error("No se pudo obtener ningún indicador macro de EE.UU. desde FRED.");
  }

  return filas;
}
