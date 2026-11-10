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

/**
 * Igual que `doctaFetch`, pero devuelve `null` en un 404 en vez de tirar —
 * para el cashflow de bonos, donde hace falta reintentar con otro ticker
 * (ver `lib/docta/cashflow.ts`) sin que el primer intento cuente como error.
 */
export async function doctaFetchOpcional<T>(path: string, { revalidateSeconds }: { revalidateSeconds: number }): Promise<T | null> {
  const token = await getDoctaAccessToken();

  const response = await fetch(`${DOCTA_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: revalidateSeconds },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Pedido a Docta falló (${path}): ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}
