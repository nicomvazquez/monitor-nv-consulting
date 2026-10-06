import { obtenerReporteDiario } from "@/lib/reportes/reporteDiario";

// Si el reporte del día todavía no está guardado, se genera acá (incluye el resumen con IA).
export const maxDuration = 60;

export async function GET() {
  const { pdf, fechaCierre } = await obtenerReporteDiario();
  const nombreArchivo = `reporte-cierre-${fechaCierre.toISOString().slice(0, 10)}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
