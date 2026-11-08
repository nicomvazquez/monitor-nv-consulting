import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ChartBar, ChartLineUp, Coins, CubeTransparent, Info, Percent, Trophy, UsersThree } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { SeccionFundamentals } from "@/components/acciones/SeccionesFundamentals";
import { construirSeccionesCripto } from "@/components/cripto/SeccionesCripto";
import { GraficoCotizacion } from "@/components/cotizaciones/GraficoCotizacion";
import { Modulo } from "@/components/ui/Modulo";
import { getHistorialCripto, getPerfilCripto } from "@/lib/coingecko/perfil";

const fetchDatos = cache(async (simbolo: string) => {
  const [perfil, historial] = await Promise.all([getPerfilCripto(simbolo), getHistorialCripto(simbolo)]);
  return { perfil, historial };
});

const ICONO_SECCION: Record<string, Icon> = {
  Mercado: ChartBar,
  Variación: Percent,
  Suministro: Coins,
  "Máximos y mínimos históricos": Trophy,
  Comunidad: UsersThree,
  "Info del proyecto": CubeTransparent,
};

export async function generateMetadata({ params }: { params: Promise<{ simbolo: string }> }): Promise<Metadata> {
  const { simbolo } = await params;
  const simboloNormalizado = simbolo.toUpperCase();
  const { perfil } = await fetchDatos(simboloNormalizado);
  return { title: `${simboloNormalizado} — ${perfil?.nombre ?? simboloNormalizado}` };
}

function EnlaceVolver() {
  return (
    <Link href="/cripto" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent">
      <ArrowLeft size={16} weight="bold" aria-hidden="true" />
      Cripto
    </Link>
  );
}

export default async function CriptoFundamentalsPage({ params }: { params: Promise<{ simbolo: string }> }) {
  const { simbolo } = await params;
  const simboloNormalizado = simbolo.toUpperCase();
  const { perfil, historial } = await fetchDatos(simboloNormalizado);

  if (!perfil) {
    return (
      <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 px-1 py-2 sm:px-6 sm:py-6">
        <EnlaceVolver />
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 max-sm:px-2.5 max-sm:py-2">
          No hay datos disponibles para {simboloNormalizado}.
        </p>
      </main>
    );
  }

  const secciones = construirSeccionesCripto(perfil);

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 px-1 py-2 sm:px-6 sm:py-6">
      <EnlaceVolver />

      <div className="flex items-center gap-3">
        <Image src={perfil.imagen} alt="" width={40} height={40} className="rounded-full" unoptimized />
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
          {simboloNormalizado} <span className="font-normal text-muted-foreground">— {perfil.nombre}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[2fr_1fr]">
        <Modulo titulo="Cotización" descripcion="Últimos 6 meses, en dólares" Icono={ChartLineUp}>
          <GraficoCotizacion historial={historial} />
        </Modulo>

        {perfil.descripcion && (
          <Modulo titulo="Sobre la moneda" Icono={Info}>
            <p className="text-xs leading-relaxed text-muted-foreground">{perfil.descripcion}</p>
            {perfil.sitioWeb && (
              <a
                href={perfil.sitioWeb}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-3 inline-block text-xs text-accent transition-colors hover:text-accent/80"
              >
                {perfil.sitioWeb}
              </a>
            )}
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

      <p className="px-1 text-[0.65rem] text-muted-foreground/60">Fuente: CoinGecko. Precios en dólares estadounidenses.</p>
    </main>
  );
}
