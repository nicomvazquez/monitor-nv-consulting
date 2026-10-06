import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getDolares } from "@/lib/dolarapi/dolares";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    default: "Cotizaciones — Mercado argentino y global en vivo",
    template: "%s — Cotizaciones",
  },
  description: DESCRIPCION,
  openGraph: {
    title: "Cotizaciones — Mercado argentino y global en vivo",
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const dolares = await fetchDolares();

  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header dolares={dolares.dolares} error={dolares.error} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
