import { ARGENTINADATOS_BASE_URL, REVALIDATE_SECONDS_UVA } from "./config";

/** Un punto de la serie de GET /v1/finanzas/indices/uva (fecha "YYYY-MM-DD", igual formato que usa el BCRA). */
export interface UvaPunto {
  fecha: string;
  valor: number;
}

/**
 * UVA (Unidad de Valor Adquisitivo): el índice de ajuste por inflación para
 * depósitos y créditos — el mismo mecanismo que el CER que ya ajusta a los
 * Bonos CER del dashboard, pero orientado a préstamos/depósitos en vez de
 * deuda pública. La API trae la serie histórica completa desde 2016; acá
 * solo se usa el último valor.
 */
export async function getUva(): Promise<UvaPunto> {
  const response = await fetch(`${ARGENTINADATOS_BASE_URL}/finanzas/indices/uva`, {
    next: { revalidate: REVALIDATE_SECONDS_UVA },
  });

  if (!response.ok) {
    throw new Error(`Pedido a ArgentinaDatos (UVA) falló (${response.status} ${response.statusText})`);
  }

  const serie = (await response.json()) as UvaPunto[];
  const ultimo = serie.at(-1);
  if (!ultimo) throw new Error("ArgentinaDatos no devolvió valores de UVA");

  return ultimo;
}
