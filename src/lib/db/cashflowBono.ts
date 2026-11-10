import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type { DoctaCashflowEntry } from "@/lib/docta/types";

/**
 * `null` si todavía no se guardó nunca el cronograma de este ticker, o si la
 * base no responde (Neon tuvo cortes intermitentes durante las pruebas) —
 * en ese caso no hay que romper la calculadora, sino caer al pedido a Docta
 * como si no hubiera cache todavía.
 */
export async function getCashflowCacheado(ticker: string): Promise<DoctaCashflowEntry[] | null> {
  try {
    const fila = await prisma.cashflowBono.findUnique({ where: { ticker } });
    return fila ? (fila.data as unknown as DoctaCashflowEntry[]) : null;
  } catch (cause) {
    console.error(`[cashflowBono] no se pudo leer el cache de "${ticker}"`, cause);
    return null;
  }
}

/**
 * `upsert` (no `create`): dos pedidos concurrentes para el mismo ticker
 * todavía sin cachear (dos visitantes eligiéndolo casi al mismo tiempo)
 * podrían pisarse — con `create` el segundo tiraría un error de clave
 * duplicada en vez de simplemente sobreescribir con el mismo dato.
 *
 * No deja que un fallo de guardado tire abajo el pedido: los datos ya se
 * consiguieron de Docta, así que el usuario los recibe igual aunque no se
 * puedan cachear en este momento (simplemente se le va a volver a pedir a
 * Docta la próxima vez).
 */
export async function guardarCashflow(ticker: string, data: DoctaCashflowEntry[]): Promise<void> {
  const json = data as unknown as Prisma.InputJsonValue;
  await prisma.cashflowBono
    .upsert({
      where: { ticker },
      create: { ticker, data: json },
      update: { data: json, fetchedAt: new Date() },
    })
    .catch((cause) => {
      console.error(`[cashflowBono] no se pudo guardar el cache de "${ticker}"`, cause);
    });
}
