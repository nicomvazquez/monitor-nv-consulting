import { INDICES_AMERICANOS } from "./config";
import { getCotizacionesYahoo } from "./cotizacion";
import type { FilaCotizacion } from "@/lib/types";

export async function getIndicesAmericanos(): Promise<FilaCotizacion[]> {
  return getCotizacionesYahoo(INDICES_AMERICANOS, "índice americano");
}
