import { pdfToPng } from "pdf-to-png-converter";
import { obtenerReporteDiario } from "./reporteDiario";

/** 2x resolución: a 1x queda borroso para leer los números más chicos de las tablas. */
const ESCALA = 2;

export interface ReportePng {
  png: Buffer;
  fechaCierre: Date;
}

/**
 * Mismo reporte que `obtenerReporteDiario`, rasterizado a PNG — el PDF que
 * arma `ReporteCierreDocument` es la única fuente de verdad del layout; acá
 * no se vuelve a dibujar nada, solo se convierte el PDF (ya cacheado, uno
 * por día) a imagen. El reporte entra en una sola página A4, así que alcanza
 * con la primera.
 */
export async function obtenerReportePng(): Promise<ReportePng> {
  const { pdf, fechaCierre } = await obtenerReporteDiario();
  const [pagina] = await pdfToPng(pdf, { viewportScale: ESCALA });
  if (!pagina?.content) throw new Error("pdf-to-png-converter no devolvió ninguna página");
  return { png: pagina.content, fechaCierre };
}
