import { DOCTA_BASE_URL } from "./config";
import { getDoctaAccessToken } from "./auth";

/**
 * Pega contra un endpoint de Docta (ej. "/api/v1/bonds/instruments"),
 * agregando el Bearer token. Usa el cache de datos de Next (`revalidate`) en
 * vez de "no-store": el plan Basic de Docta tiene un límite de apenas 15
 * pedidos por día PARA TODA LA APP (no por usuario) — sin cachear, cualquier
 * ráfaga de tráfico agota la cuota del día. `revalidateSeconds` tiene que
 * ser generoso (horas, no segundos) para los datos que se piden acá.
 */
export async function doctaFetch<T>(path: string, { revalidateSeconds }: { revalidateSeconds: number }): Promise<T> {
  const token = await getDoctaAccessToken();

  const response = await fetch(`${DOCTA_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(`Pedido a Docta falló (${path}): ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}
