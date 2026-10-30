import { doctaFetch } from "./client";
import type { DoctaBondInstrument, DoctaBondInstrumentsResponse } from "./types";

/**
 * Datos de referencia (sin precio en vivo a propósito: con la cuota de
 * Docta en 15 pedidos/día para toda la app, traer precio/TIR por cada ON
 * agotaría la cuota enseguida — ver `doctaFetch`). 24hs de caché: esta
 * metadata (emisor, sector, ley) prácticamente no cambia día a día.
 */
const REVALIDATE_SECONDS_ON = 60 * 60 * 24;

/**
 * El universo de bonos de Docta mezcla soberanos (`HARD_DOLLAR`, `CER`, ...)
 * con corporativos: todo lo que arranca con "ON" (`ON`, `ON_DOLLAR_LINKED`,
 * `ON_TAMAR`, ...) es una obligación negociable. Se filtra por prefijo en vez
 * de una lista cerrada de valores para no quedar afuera si aparece una
 * sub-clase nueva.
 *
 * TODO: verificar contra la API real si `/bonds/instruments` pagina (el
 * OpenAPI documenta `limit`/`cursor` como opcionales) — esto se escribió con
 * la cuota diaria ya agotada, sin poder confirmar si una sola página trae
 * todo el universo. Si en producción aparecen menos ONs de las esperadas,
 * paginar con `cursor`.
 */
export interface ObligacionNegociable {
  ticker: string;
  nombre: string;
  sector: string;
  emisor: string;
  ley: string;
  isin: string;
}

function esObligacionNegociable(instrumento: DoctaBondInstrument): boolean {
  return instrumento.asset_class === "BOND" && instrumento.sub_asset_class.startsWith("ON");
}

function aObligacionNegociable(instrumento: DoctaBondInstrument): ObligacionNegociable {
  return {
    ticker: instrumento.ticker,
    nombre: instrumento.name ?? instrumento.ticker,
    sector: instrumento.sector ?? "Sin clasificar",
    emisor: instrumento.issuer ?? "Sin clasificar",
    ley: instrumento.law ?? "Sin clasificar",
    isin: instrumento.isin ?? "-",
  };
}

export async function getObligacionesNegociables(): Promise<ObligacionNegociable[]> {
  const { data } = await doctaFetch<DoctaBondInstrumentsResponse>("/api/v1/bonds/instruments", {
    revalidateSeconds: REVALIDATE_SECONDS_ON,
  });

  return data.filter(esObligacionNegociable).map(aObligacionNegociable).sort((a, b) => a.ticker.localeCompare(b.ticker));
}
