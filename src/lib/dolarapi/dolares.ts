import { DOLARAPI_BASE_URL, REVALIDATE_SECONDS_DOLARES } from "./config";
import type { Dolar } from "./types";

export async function getDolares(): Promise<Dolar[]> {
  const response = await fetch(`${DOLARAPI_BASE_URL}/dolares`, {
    next: { revalidate: REVALIDATE_SECONDS_DOLARES },
  });

  if (!response.ok) {
    throw new Error(`Pedido a dolarapi.com falló (${response.status} ${response.statusText})`);
  }

  return (await response.json()) as Dolar[];
}

/** Solo el contado con liquidación: lo usa `getIndicesAmericanos` para pasar el Merval a dólares. */
export async function getDolarContadoConLiqui(): Promise<Dolar> {
  const response = await fetch(`${DOLARAPI_BASE_URL}/dolares/contadoconliqui`, {
    next: { revalidate: REVALIDATE_SECONDS_DOLARES },
  });

  if (!response.ok) {
    throw new Error(`Pedido a dolarapi.com (CCL) falló (${response.status} ${response.statusText})`);
  }

  return (await response.json()) as Dolar;
}
