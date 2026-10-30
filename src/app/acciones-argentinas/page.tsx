import { Table } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { TablaAccionesCompleta } from "@/components/acciones/TablaAccionesCompleta";
import { Modulo } from "@/components/ui/Modulo";
import { getAccionesArgentinas } from "@/lib/iol/cotizaciones";
import type { AccionCompleta } from "@/lib/iol/types";

export const metadata: Metadata = {
  title: "Acciones argentinas",
  description: "Todas las acciones del Panel Líder y el Panel General de BYMA, con precio, variación, apertura, máximo, mínimo, puntas y volumen.",
};

async function fetchPaneles(): Promise<{ lider: AccionCompleta[]; general: AccionCompleta[]; error: string | null }> {
  try {
    const [lider, general] = await Promise.all([getAccionesArgentinas("lider"), getAccionesArgentinas("general")]);
    return { lider, general, error: null };
  } catch (cause) {
    console.error("[acciones-argentinas]", cause);
    return { lider: [], general: [], error: "No se pudieron cargar las acciones. Probá recargar la página en unos minutos." };
  }
}

export default async function AccionesArgentinasPage() {
  const { lider, general, error } = await fetchPaneles();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Acciones argentinas</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Panel Líder y Panel General de BYMA, con todos los datos que informa IOL: precio, apertura, máximo, mínimo, cierre anterior, puntas de compra/venta, volumen y operaciones.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 max-sm:px-2.5 max-sm:py-2">
          {error}
        </p>
      )}

      {!error && (
        <Modulo titulo="Cotizaciones" descripcion="Elegí el panel para ver sus acciones" Icono={Table}>
          <TablaAccionesCompleta lider={lider} general={general} />
        </Modulo>
      )}
    </main>
  );
}
