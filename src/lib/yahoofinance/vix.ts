import { VIX } from "./config";
import { getCotizacionYahoo } from "./cotizacion";
import { formatPrice } from "@/lib/format";
import type { FilaIndicador, ModoPrecio } from "@/lib/types";

/** El VIX se muestra en el panel de indicadores macro de EE.UU. (fila destacada), no como una cotización más. */
export async function getVix(modo: ModoPrecio = "auto"): Promise<FilaIndicador> {
  const fila = await getCotizacionYahoo(VIX, modo);
  return {
    nombre: VIX.nombre,
    valor: fila.ultimoPrecio !== null ? formatPrice(fila.ultimoPrecio) : "-",
    fecha: "",
  };
}
