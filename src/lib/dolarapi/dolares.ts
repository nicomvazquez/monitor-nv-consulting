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
