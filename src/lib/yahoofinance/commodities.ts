import { COMMODITIES } from "./config";
import { getCotizacionesYahoo } from "./cotizacion";
import type { FilaCotizacion } from "@/lib/types";

export async function getCommodities(): Promise<FilaCotizacion[]> {
  return getCotizacionesYahoo(COMMODITIES, "commodity");
}
