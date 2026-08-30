import { PanelSection } from "@/components/cotizaciones/PanelSection";
import { getCaucionesTabla } from "@/lib/iol/caucion";
import {
  getBonosCer,
  getBonosSoberanosDolaresMep,
  getCedearsPrincipales,
  getLetras,
  getPanelLider,
} from "@/lib/iol/cotizaciones";
import { isMercadoAbierto } from "@/lib/iol/market-hours";
import type { FilaCotizacion } from "@/lib/iol/types";

async function fetchPanel(fetcher: () => Promise<FilaCotizacion[]>) {
  try {
    return { items: await fetcher(), error: null as string | null };
  } catch (cause) {
    return {
      items: null,
      error: cause instanceof Error ? cause.message : "Error desconocido al consultar IOL.",
    };
  }
}

export default async function HomePage() {
  const [caucion, panelLider, cedears, bonosDolares, letras, bonosCer] = await Promise.all([
    fetchPanel(getCaucionesTabla),
    fetchPanel(getPanelLider),
    fetchPanel(getCedearsPrincipales),
    fetchPanel(getBonosSoberanosDolaresMep),
    fetchPanel(getLetras),
    fetchPanel(getBonosCer),
  ]);

  const columnaPrecio = isMercadoAbierto() ? "Último" : "Cierre";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
      <PanelSection
        title="Caución"
        description="Tasa promedio operada (TNA %) a 1, 7 y 14 días, en pesos y en dólares."
        mostrarVariacion={false}
        columnaPrecio={columnaPrecio}
        {...caucion}
      />
      <PanelSection
        title="Panel Líder"
        description="Cotizaciones de acciones argentinas vía la API de IOL (invertirOnline)."
        columnaPrecio={columnaPrecio}
        {...panelLider}
      />
      <PanelSection
        title="CEDEARs principales"
        description="Los CEDEARs más operados del día en Argentina."
        columnaPrecio={columnaPrecio}
        {...cedears}
      />
      <PanelSection
        title="Bonos soberanos en dólares (MEP)"
        description="Bonares, Globales, Discount, Par y Bonos del Tesoro en USD, liquidación MEP."
        columnaPrecio={columnaPrecio}
        {...bonosDolares}
      />
      <PanelSection
        title="Letras"
        description="LECAPs y LECER del Tesoro Nacional en pesos."
        columnaPrecio={columnaPrecio}
        {...letras}
      />
      <PanelSection
        title="Bonos CER"
        description="Boncer y demás deuda del Tesoro Nacional en pesos ajustada por CER."
        columnaPrecio={columnaPrecio}
        {...bonosCer}
      />
    </main>
  );
}
