import { obtenerReporteDiario } from "@/lib/reportes/reporteDiario";
import { obtenerReportePng } from "@/lib/reportes/reportePng";

// Si el reporte del día todavía no está guardado, se genera acá (incluye el resumen con IA).
// La conversión a PNG parte del mismo PDF ya generado, así que no suma mucho más tiempo.
export const maxDuration = 60;

export async function GET(request: Request) {
  const formato = new URL(request.url).searchParams.get("formato") === "png" ? "png" : "pdf";

  if (formato === "png") {
    const { png, fechaCierre } = await obtenerReportePng();
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="reporte-cierre-${fechaCierre.toISOString().slice(0, 10)}.png"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const { pdf, fechaCierre } = await obtenerReporteDiario();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte-cierre-${fechaCierre.toISOString().slice(0, 10)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
