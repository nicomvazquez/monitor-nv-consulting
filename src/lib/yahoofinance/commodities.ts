import { COMMODITIES } from "./config";
import { getCotizacionesYahoo } from "./cotizacion";
import type { FilaCotizacion, ModoPrecio } from "@/lib/types";

export async function getCommodities(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  return getCotizacionesYahoo(COMMODITIES, "commodity", modo);
}
