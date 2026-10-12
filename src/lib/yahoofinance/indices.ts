import { INDICES_AMERICANOS, USD_BRL } from "./config";
import { getCotizacionYahoo, getCotizacionesYahoo } from "./cotizacion";
import { getDolarContadoConLiqui } from "@/lib/dolarapi/dolares";
import type { FilaCotizacion, ModoPrecio } from "@/lib/types";

/**
 * Merval y Bovespa se muestran en dólares (convención habitual para comparar
 * índices que cotizan en monedas distintas a las del resto del panel):
 * Merval se divide por el contado con liquidación (el tipo de cambio
 * implícito en los activos que cotizan en ambos mercados) y Bovespa por el
 * tipo de cambio USD/BRL de Yahoo. La variación % queda la original en
 * moneda local — no hay forma de obtener el CCL/USDBRL de ayer para
 * recalcularla en dólares sin agregar una fuente de datos históricos. Si
 * falla el dato de conversión, el índice se muestra igual pero en su moneda
 * local en vez de romper todo el panel.
 */
export async function getIndicesAmericanos(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const [indices, ccl, usdBrl] = await Promise.all([
    getCotizacionesYahoo(INDICES_AMERICANOS, "índice americano", modo),
    getDolarContadoConLiqui().catch(() => null),
    getCotizacionYahoo(USD_BRL, modo).catch(() => null),
  ]);

  return indices.map((item) => {
    if (item.simbolo === "Merval (USD)" && ccl && item.ultimoPrecio !== null) {
      return { ...item, ultimoPrecio: item.ultimoPrecio / ccl.venta };
    }
    if (item.simbolo === "Bovespa (USD)" && usdBrl?.ultimoPrecio && item.ultimoPrecio !== null) {
      return { ...item, ultimoPrecio: item.ultimoPrecio / usdBrl.ultimoPrecio };
    }
    return item;
  });
}
