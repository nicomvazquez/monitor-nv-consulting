import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCryptosIniciales } from "@/lib/binance/cryptos";
import { getDolares } from "@/lib/dolarapi/dolares";

// Reemplaza a Inter: "financial, trustworthy, professional" es justo el tono
// que pide un dashboard de mercado — y sigue siendo tan legible como Inter
// en tamaños chicos, que acá abundan (tablas densas).
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const DESCRIPCION =
  "Dashboard financiero en vivo: acciones, bonos y CEDEARs argentinos, dólares, caución, " +
  "criptomonedas, índices y commodities internacionales, indicadores macro de Argentina y Estados " +
  "Unidos, y una calculadora de bonos soberanos.";

export const metadata: Metadata = {
  title: {
    default: "Monitor — Mercado argentino y global en vivo",
    template: "%s — Monitor",
  },
  description: DESCRIPCION,
  openGraph: {
    title: "Monitor — Mercado argentino y global en vivo",
    description: DESCRIPCION,
    locale: "es_AR",
    type: "website",
  },
};

async function fetchDolares() {
  try {
    return { dolares: await getDolares(), error: null as string | null };
  } catch (cause) {
    console.error("[dolares]", cause);
    return {
      dolares: null,
      error: "No se pudieron cargar las cotizaciones del dólar. Probá recargar la página en unos minutos.",
    };
  }
}

/** Para el precio al lado del logo en el header — se pide acá (no en cada página) porque el header vive en el layout raíz y se muestra en todo el sitio. */
async function fetchBtc() {
  try {
    const cryptos = await getCryptosIniciales();
    return cryptos.find((c) => c.simbolo === "BTC") ?? null;
  } catch (cause) {
    console.error("[btc-header]", cause);
    return null;
  }
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [dolares, btc, sesion] = await Promise.all([fetchDolares(), fetchBtc(), auth()]);

  return (
    <html
      lang="es"
      className={`${plexSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header dolares={dolares.dolares} error={dolares.error} btc={btc} sesion={sesion} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
