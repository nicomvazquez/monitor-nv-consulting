import { env } from "@/config/env";
import { COINGECKO_BASE_URL } from "./config";

/**
 * Pega contra un endpoint de CoinGecko (ej. "/coins/bitcoin"), con la API key
 * del plan Demo gratuito en el header que corresponde a ese plan — distinto
 * del header "x-cg-pro-api-key" que usa el plan Pro (verificado a mano contra
 * la documentación: con el header equivocado, el plan Demo devuelve 401 igual
 * que sin ninguna key).
 */
export async function coingeckoFetch<T>(path: string, { revalidateSeconds }: { revalidateSeconds: number }): Promise<T> {
  const response = await fetch(`${COINGECKO_BASE_URL}${path}`, {
    headers: { "x-cg-demo-api-key": env.coingeckoApiKey },
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Pedido a CoinGecko falló (${path}): ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}
