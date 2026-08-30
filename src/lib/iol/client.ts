import { getAccessToken } from "./auth";
import { IOL_BASE_URL } from "./config";

interface IolFetchOptions {
  /** Segundos que Next.js puede servir la respuesta desde caché (ISR) antes de volver a pedirla. */
  revalidateSeconds: number;
}

export async function iolFetch<T>(
  path: string,
  { revalidateSeconds }: IolFetchOptions,
): Promise<T> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${IOL_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: revalidateSeconds },
  });

  if (!response.ok) {
    throw new Error(
      `Pedido a IOL falló: ${path} (${response.status} ${response.statusText})`,
    );
  }

  return (await response.json()) as T;
}
