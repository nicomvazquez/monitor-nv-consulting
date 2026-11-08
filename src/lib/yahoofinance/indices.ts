import { INDICES_AMERICANOS, USD_BRL } from "./config";
import { getCotizacionYahoo, getCotizacionesYahoo } from "./cotizacion";
import { getDolares } from "@/lib/dolarapi/dolares";
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
 *
 * El CCL sale de `getDolares()` (todas las cotizaciones del dólar), no de un
 * pedido aparte a `/dolares/contadoconliqui`: esa lista ya lo trae como uno
 * de sus elementos, y `getDolares()` ya se pide siempre en el layout raíz
 * (para el header) — pedirlo nosotros de nuevo con el mismo caché de Next
 * no vuelve a salir a la red, mientras que el endpoint aparte sí era un
 * pedido extra real a dolarapi.com en cada carga de la home/el reporte.
 */
export async function getIndicesAmericanos(modo: ModoPrecio = "auto"): Promise<FilaCotizacion[]> {
  const [indices, dolares, usdBrl] = await Promise.all([
    getCotizacionesYahoo(INDICES_AMERICANOS, "índice americano", modo),
    getDolares().catch(() => null),
    getCotizacionYahoo(USD_BRL, modo).catch(() => null),
  ]);

  const ccl = dolares?.find((dolar) => dolar.casa === "contadoconliqui") ?? null;

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
