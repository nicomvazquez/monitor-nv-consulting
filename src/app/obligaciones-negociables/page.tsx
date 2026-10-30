import { Scroll } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { TablaObligacionesNegociables } from "@/components/obligacionesNegociables/TablaObligacionesNegociables";
import { Modulo } from "@/components/ui/Modulo";
import { getObligacionesNegociables } from "@/lib/docta/obligacionesNegociables";
import type { ObligacionNegociable } from "@/lib/docta/obligacionesNegociables";

export const metadata: Metadata = {
  title: "Obligaciones negociables",
  description: "Obligaciones negociables argentinas: ticker, emisor, sector, ley aplicable e ISIN, con filtros por sector, emisor y ley.",
};

async function fetchObligaciones(): Promise<{ obligaciones: ObligacionNegociable[]; error: string | null }> {
  try {
    return { obligaciones: await getObligacionesNegociables(), error: null };
  } catch (cause) {
    console.error("[obligaciones-negociables]", cause);
    return { obligaciones: [], error: "No se pudieron cargar las obligaciones negociables. Probá recargar la página en unos minutos." };
  }
}

export default async function ObligacionesNegociablesPage() {
  const { obligaciones, error } = await fetchObligaciones();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Obligaciones negociables</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Listado de referencia (ticker, emisor, sector, ley aplicable e ISIN), con datos provistos por Docta Capital. Sin precio en vivo.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 max-sm:px-2.5 max-sm:py-2">
          {error}
        </p>
      )}

      {!error && (
        <Modulo titulo="Obligaciones negociables" descripcion="Filtrá por sector, emisor o ley" Icono={Scroll}>
          <TablaObligacionesNegociables obligaciones={obligaciones} />
        </Modulo>
      )}
    </main>
  );
}
