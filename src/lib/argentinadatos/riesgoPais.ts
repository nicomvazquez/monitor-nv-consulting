import { ARGENTINADATOS_BASE_URL, REVALIDATE_SECONDS_RIESGO_PAIS } from "./config";
import type { RiesgoPais } from "./types";

export async function getRiesgoPais(): Promise<RiesgoPais> {
  const response = await fetch(`${ARGENTINADATOS_BASE_URL}/finanzas/indices/riesgo-pais/ultimo`, {
    next: { revalidate: REVALIDATE_SECONDS_RIESGO_PAIS },
  });

  if (!response.ok) {
    throw new Error(`Pedido a ArgentinaDatos falló (${response.status} ${response.statusText})`);
  }

  return (await response.json()) as RiesgoPais;
}
