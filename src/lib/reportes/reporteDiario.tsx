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
 * Generación en curso para una fecha (si hay una). Sin esto, dos pedidos que
 * llegan casi al mismo tiempo y todavía no encuentran nada guardado
 * disparaban cada uno su propia generación — y como el resumen lo redacta un
 * modelo, nunca da el mismo texto dos veces, así que cada pestaña/visita
 * terminaba viendo una versión distinta del reporte del mismo día. Vive en
 * memoria del proceso: alcanza para el caso real (pestañas del mismo
 * usuario, visitas a la misma instancia tibia de Vercel); no corta una
 * carrera entre dos instancias serverless distintas arrancando en frío a la
 * vez, pero eso es un caso mucho más raro y el cron ya deja el reporte
 * guardado antes de que llegue tráfico real la mayoría de los días.
 */
let generacionEnCurso: { fecha: string; promesa: Promise<ReporteDiario> } | null = null;

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
  const fechaCierre = await getFechaUltimoCierre();
  const clave = fechaCierre.toISOString().slice(0, 10);

  if (!regenerar) {
    const guardado = await leerReporte(fechaCierre).catch((cause) => {
      console.error("[reporte-cierre:leer]", cause);
      return null;
    });
    if (guardado) return { pdf: guardado, fechaCierre };
  }

  if (generacionEnCurso?.fecha === clave) return generacionEnCurso.promesa;

  const promesa = (async () => {
    const reporte = await generar();
    await guardarReporte(reporte.fechaCierre, reporte.pdf).catch((cause) => {
      console.error("[reporte-cierre:guardar]", cause);
    });
    return reporte;
  })();

  generacionEnCurso = { fecha: clave, promesa };
  try {
    return await promesa;
  } finally {
    if (generacionEnCurso?.promesa === promesa) generacionEnCurso = null;
  }
}
