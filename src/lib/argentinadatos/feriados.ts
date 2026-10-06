import { ARGENTINADATOS_BASE_URL, REVALIDATE_SECONDS_FERIADOS } from "./config";

/** Forma real (verificada a mano) de cada elemento de GET /v1/feriados/{año}. */
interface Feriado {
  fecha: string;
  tipo: string;
  nombre: string;
}

/**
 * Fechas feriadas ("YYYY-MM-DD") de un año, para que `lib/iol/market-hours.ts`
 * sepa que un día hábil puede no ser un día de rueda. Best-effort: si el
 * pedido falla, devuelve un set vacío (se vuelve al comportamiento de antes,
 * sin feriados) en vez de romper el cálculo de horario de mercado.
 */
export async function getFeriados(anio: number): Promise<Set<string>> {
  try {
    const response = await fetch(`${ARGENTINADATOS_BASE_URL}/feriados/${anio}`, {
      next: { revalidate: REVALIDATE_SECONDS_FERIADOS },
    });
    if (!response.ok) return new Set();

    const feriados = (await response.json()) as Feriado[];
    return new Set(feriados.map((feriado) => feriado.fecha));
  } catch (cause) {
    console.error(`[feriados:${anio}]`, cause);
    return new Set();
  }
}
