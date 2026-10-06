import { getUva } from "@/lib/argentinadatos/uva";
import { BCRA_BASE_URL, MACRO_IDS, REVALIDATE_SECONDS_MACRO } from "./config";
import type { BcraMonetariasResponse, BcraVariable } from "./types";

async function getVariablesBcra(): Promise<BcraVariable[]> {
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

/** No es una variable real del BCRA (idVariable negativo a propósito, para no colisionar con ningún id real). */
const ID_UVA_SINTETICO = -1;

/**
 * UVA no es del BCRA sino de ArgentinaDatos (`lib/argentinadatos/uva.ts`),
 * pero se arma como si fuera una `BcraVariable` más para que
 * `MacroSection`/`MacroCard` la rendericen gratis, sin tocar ese componente.
 * Best-effort aparte del resto: si falla, no tira abajo el panel entero, solo
 * no se agrega esta fila.
 */
async function getUvaComoVariable(): Promise<BcraVariable | null> {
  try {
    const uva = await getUva();
    return {
      idVariable: ID_UVA_SINTETICO,
      descripcion: "UVA (actualización por inflación)",
      categoria: "Índices",
      tipoSerie: "",
      periodicidad: "Diaria",
      unidadExpresion: "índice",
      moneda: "",
      primerFechaInformada: "",
      ultFechaInformada: uva.fecha,
      ultValorInformado: uva.valor,
    };
  } catch (cause) {
    console.error("[macro-bcra:uva]", cause);
    return null;
  }
}

export async function getIndicadoresMacro(): Promise<BcraVariable[]> {
  const [variables, uva] = await Promise.all([getVariablesBcra(), getUvaComoVariable()]);
  return uva ? [...variables, uva] : variables;
}
