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

export const metadata: Metadata = {
  title: "Cotizaciones IOL",
  description: "Cotizaciones en vivo desde la API de IOL invertirOnline.",
};

async function fetchDolares() {
  try {
    return { dolares: await getDolares(), error: null as string | null };
  } catch (cause) {
    return {
      dolares: null,
      error: cause instanceof Error ? cause.message : "Error desconocido al consultar dolarapi.com.",
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
