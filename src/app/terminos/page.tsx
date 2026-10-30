import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: "Condiciones de uso de Monitor: qué es, qué garantías no ofrece y responsabilidades de cada parte.",
};

const ULTIMA_ACTUALIZACION = "30 de octubre de 2026";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-foreground sm:text-lg">{titulo}</h2>
      <div className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function TerminosDeUsoPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Términos de uso</h1>
        <p className="mt-1 text-xs text-muted-foreground/70">Última actualización: {ULTIMA_ACTUALIZACION}</p>
      </div>

      <Seccion titulo="Qué es Monitor">
        <p>
          Monitor es un panel informativo gratuito, de uso personal, que muestra cotizaciones de mercado
          (dólares, acciones, bonos, cripto, indicadores macro) y noticias, agregando información pública de
          distintas fuentes. Usar el sitio implica aceptar estos términos.
        </p>
      </Seccion>

      <Seccion titulo="No es asesoramiento financiero">
        <p>
          Toda la información del sitio es con fines de referencia. No constituye asesoramiento financiero, de
          inversión, legal ni impositivo, y no reemplaza la consulta con un profesional matriculado. Ninguna
          decisión de inversión debería tomarse basándose únicamente en lo que muestra Monitor.
        </p>
      </Seccion>

      <Seccion titulo="Exactitud de la información">
        <p>
          Los datos provienen de terceros (IOL, BCRA, dolarapi.com, ArgentinaDatos, Binance, Yahoo Finance, FRED,
          Docta Capital, Google Noticias) y pueden tener demoras, estar incompletos o contener errores que están
          fuera de nuestro control. No garantizamos exactitud, actualidad ni disponibilidad continua del sitio
          ni de los datos que muestra.
        </p>
      </Seccion>

      <Seccion titulo="Límite de responsabilidad">
        <p>
          El uso del sitio es bajo tu propia responsabilidad. No nos hacemos responsables por pérdidas,
          perjuicios o decisiones tomadas a partir de la información mostrada, ni por interrupciones del
          servicio.
        </p>
      </Seccion>

      <Seccion titulo="Inicio de sesión con Google">
        <p>
          Algunas secciones (Noticias, Calculadora de bonos, reporte diario) requieren iniciar sesión con una
          cuenta de Google. No se crea una cuenta propia del sitio ni se pide contraseña — ver la{" "}
          <Link href="/privacidad" className="text-accent hover:underline">
            Política de privacidad
          </Link>{" "}
          para el detalle de qué datos se usan.
        </p>
      </Seccion>

      <Seccion titulo="Uso aceptable">
        <p>
          No está permitido hacer scraping automatizado masivo del sitio, intentar sobrecargarlo, ni usarlo de
          una forma que afecte su funcionamiento o el de las APIs de terceros que consulta.
        </p>
      </Seccion>

      <Seccion titulo="Propiedad intelectual">
        <p>
          El diseño, el código y la marca &ldquo;Monitor&rdquo; pertenecen a Nicolás Vázquez. Los datos de mercado y las
          noticias pertenecen a sus respectivas fuentes, citadas en el pie de página.
        </p>
      </Seccion>

      <Seccion titulo="Cambios a estos términos">
        <p>Estos términos pueden actualizarse. La fecha de arriba indica la versión vigente.</p>
      </Seccion>

      <Seccion titulo="Ley aplicable">
        <p>Estos términos se rigen por las leyes de la República Argentina.</p>
      </Seccion>

      <p className="pt-2 text-xs text-muted-foreground/70">
        Consultas:{" "}
        <a href="mailto:vazquezpizzinicolas@gmail.com" className="text-accent hover:underline">
          vazquezpizzinicolas@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
