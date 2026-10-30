import { cache } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Bank, Buildings, ChartBar, ChartLineUp, Coins, Percent, Receipt, Scales, Target, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { GraficoCotizacion } from "@/components/acciones/GraficoCotizacion";
import { construirSecciones, SeccionFundamentals } from "@/components/acciones/SeccionesFundamentals";
import { Modulo } from "@/components/ui/Modulo";
import { getFundamentals, getHistorialPrecio } from "@/lib/yahoofinance/fundamentals";

// `cache()`: tanto `generateMetadata` como la página piden los datos del
// mismo símbolo — sin esto, Next los pediría dos veces (no dedupea llamadas
// a yahoo-finance2 como sí hace con su `fetch` extendido).
const fetchDatos = cache(async (simbolo: string) => {
  const [fundamentals, historial] = await Promise.all([getFundamentals(simbolo), getHistorialPrecio(simbolo)]);
  return { fundamentals, historial };
});

/** Un ícono por sección, para que la grilla de tarjetas se escanee tan rápido como el resto de la app — las claves son los títulos literales que arma `construirSecciones`. */
const ICONO_SECCION: Record<string, Icon> = {
  Valuación: Scales,
  "Precio y volumen": ChartBar,
  "Rentabilidad y márgenes": Percent,
  Resultados: Receipt,
  "Balance y caja": Bank,
  Dividendos: Coins,
  Tenencia: UsersThree,
  Analistas: Target,
};

export async function generateMetadata({ params }: { params: Promise<{ simbolo: string }> }): Promise<Metadata> {
  const { simbolo } = await params;
  const simboloNormalizado = simbolo.toUpperCase();
  const { fundamentals } = await fetchDatos(simboloNormalizado);
  const nombre = fundamentals?.price?.longName ?? fundamentals?.price?.shortName ?? simboloNormalizado;
  return { title: `${simboloNormalizado} — ${nombre}` };
}

function EnlaceVolver() {
  return (
    <Link href="/acciones-argentinas" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent">
      <ArrowLeft size={16} weight="bold" aria-hidden="true" />
      Acciones argentinas
    </Link>
  );
}

export default async function AccionFundamentalsPage({ params }: { params: Promise<{ simbolo: string }> }) {
  const { simbolo } = await params;
  const simboloNormalizado = simbolo.toUpperCase();
  const { fundamentals, historial } = await fetchDatos(simboloNormalizado);

  if (!fundamentals) {
    return (
      <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 px-1 py-2 sm:px-6 sm:py-6">
        <EnlaceVolver />
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 max-sm:px-2.5 max-sm:py-2">
          No hay datos fundamentales disponibles para {simboloNormalizado}.
        </p>
      </main>
    );
  }

  const perfil = fundamentals.assetProfile;
  const nombre = fundamentals.price?.longName ?? fundamentals.price?.shortName ?? simboloNormalizado;
  const secciones = construirSecciones(fundamentals);

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 px-1 py-2 sm:px-6 sm:py-6">
      <EnlaceVolver />

      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
          {simboloNormalizado} <span className="font-normal text-muted-foreground">— {nombre}</span>
        </h1>
        {perfil && (perfil.sector || perfil.industry) && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {perfil.sector}
            {perfil.sector && perfil.industry ? " · " : ""}
            {perfil.industry}
            {perfil.fullTimeEmployees ? ` · ${perfil.fullTimeEmployees.toLocaleString("es-AR")} empleados` : ""}
          </p>
        )}
      </div>

      {/* Cotización + perfil de la empresa, lado a lado en pantallas anchas — mismo criterio que
          la home (contenido grande a la izquierda, contexto más chico a la derecha). */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[2fr_1fr]">
        <Modulo titulo="Cotización" descripcion="Últimos 6 meses" Icono={ChartLineUp}>
          <GraficoCotizacion historial={historial} />
        </Modulo>

        {perfil?.longBusinessSummary && (
          <Modulo titulo="Sobre la empresa" Icono={Buildings}>
            <p className="text-xs leading-relaxed text-muted-foreground">{perfil.longBusinessSummary}</p>
          </Modulo>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {secciones.map((seccion) => (
          <Modulo key={seccion.titulo} titulo={seccion.titulo} Icono={ICONO_SECCION[seccion.titulo]}>
            <SeccionFundamentals seccion={seccion} />
          </Modulo>
        ))}
      </div>

      <p className="px-1 text-[0.65rem] text-muted-foreground/60">
        Fuente: Yahoo Finance ({simboloNormalizado}.BA). Puede haber datos faltantes o desactualizados para acciones poco operadas.
      </p>
    </main>
  );
}
