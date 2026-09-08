import { BCRA_BASE_URL, MACRO_IDS, REVALIDATE_SECONDS_MACRO } from "./config";
import type { BcraMonetariasResponse, BcraVariable } from "./types";

export async function getIndicadoresMacro(): Promise<BcraVariable[]> {
  const response = await fetch(`${BCRA_BASE_URL}/monetarias`, {
    next: { revalidate: REVALIDATE_SECONDS_MACRO },
  });

  if (!response.ok) {
    throw new Error(`Pedido al BCRA falló (${response.status} ${response.statusText})`);
  }

  const { results } = (await response.json()) as BcraMonetariasResponse;
  const orden = new Map(MACRO_IDS.map((id, indice) => [id as number, indice]));

  return results
    .filter((variable) => orden.has(variable.idVariable))
    .sort((a, b) => orden.get(a.idVariable)! - orden.get(b.idVariable)!);
}
