import { renderToBuffer } from "@react-pdf/renderer";
import { ReporteCierreDocument } from "@/components/reportes/ReporteCierreDocument";
import { getFechaUltimoCierre } from "@/lib/iol/market-hours";
import { guardarReporte, leerReporte } from "./almacenamiento";
import { getDatosReporte } from "./datosReporte";
import { getResumenIA } from "./resumenIA";

export interface ReporteDiario {
  pdf: Buffer;
  fechaCierre: Date;
}

async function generar(): Promise<ReporteDiario> {
  const datos = await getDatosReporte();
  const resumen = await getResumenIA(datos);
  const pdf = await renderToBuffer(<ReporteCierreDocument datos={datos} resumen={resumen} />);
  return { pdf, fechaCierre: datos.fechaCierre };
}

/**
 * El reporte del último cierre, uno por día: si ya está guardado se sirve tal
 * cual (los datos y el resumen con IA no cambian hasta el próximo cierre); si
 * no, se genera y se guarda. Sirve de red de seguridad si el cron falló o si
 * es el primer día y todavía no hay ninguno.
 *
 * `regenerar` (lo usa el cron) fuerza pisar el guardado: si alguien lo bajó
 * entre las 17hs y la corrida del cron, la versión definitiva reemplaza a
 * la que pudo haberse armado con el cierre todavía sin actualizar.
 */
export async function obtenerReporteDiario({ regenerar = false } = {}): Promise<ReporteDiario> {
  if (!regenerar) {
    const fechaCierre = await getFechaUltimoCierre();
    const guardado = await leerReporte(fechaCierre).catch((cause) => {
      console.error("[reporte-cierre:leer]", cause);
      return null;
    });
    if (guardado) return { pdf: guardado, fechaCierre };
  }

  const reporte = await generar();
  await guardarReporte(reporte.fechaCierre, reporte.pdf).catch((cause) => {
    console.error("[reporte-cierre:guardar]", cause);
  });
  return reporte;
}
