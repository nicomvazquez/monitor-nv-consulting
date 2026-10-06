import { obtenerReporteDiario } from "@/lib/reportes/reporteDiario";

export const maxDuration = 60;

/**
 * Lo dispara el cron de Vercel (ver `vercel.json`) después del cierre de
 * mercado. Vercel manda `Authorization: Bearer $CRON_SECRET`; sin
 * `CRON_SECRET` definido la ruta rechaza todo, para que nadie pueda gatillar
 * la generación (y gastar cuota de la IA) desde afuera.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new Response("No autorizado", { status: 401 });
  }

  const { fechaCierre, pdf } = await obtenerReporteDiario({ regenerar: true });
  return Response.json({ ok: true, fechaCierre: fechaCierre.toISOString().slice(0, 10), bytes: pdf.length });
}
