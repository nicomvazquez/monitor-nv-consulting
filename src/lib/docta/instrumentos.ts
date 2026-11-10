import { doctaFetch } from "./client";
import type { DoctaBondInstrument, DoctaBondInstrumentsResponse } from "./types";

/**
 * Metadata de referencia de TODO el universo de bonos de Docta (soberanos +
 * obligaciones negociables) — un solo fetch, cacheado 24hs (ver `doctaFetch`),
 * compartido entre `obligacionesNegociables.ts` (que lo filtra a solo ONs) y
 * la calculadora de TIR (que lo usa completo para el selector de bonos). Que
 * ambos lean de esta misma función es lo que hace que compartan la misma
 * entrada de cache de Next — pedirlo dos veces no cuesta una segunda consulta
 * real a Docta.
 */
const REVALIDATE_SECONDS_INSTRUMENTOS = 60 * 60 * 24;

export async function getBondInstruments(): Promise<DoctaBondInstrument[]> {
  const { data } = await doctaFetch<DoctaBondInstrumentsResponse>("/api/v1/bonds/instruments", {
    revalidateSeconds: REVALIDATE_SECONDS_INSTRUMENTOS,
  });
  return data;
}
