import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos recolecta Monitor, para qué los usa y cómo ejercer tus derechos sobre ellos.",
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

export default function PoliticaPrivacidadPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Política de privacidad</h1>
        <p className="mt-1 text-xs text-muted-foreground/70">Última actualización: {ULTIMA_ACTUALIZACION}</p>
      </div>

      <Seccion titulo="Quién es responsable">
        <p>
          Monitor es un proyecto personal de Nicolás Vázquez. No es una empresa constituida ni un servicio
          financiero regulado — es un panel informativo gratuito. Cualquier consulta sobre tus datos la podés
          hacer a{" "}
          <a href="mailto:vazquezpizzinicolas@gmail.com" className="text-accent hover:underline">
            vazquezpizzinicolas@gmail.com
          </a>
          .
        </p>
      </Seccion>

      <Seccion titulo="Qué datos recolectamos">
        <p>
          Navegar el sitio sin iniciar sesión no requiere ni guarda ningún dato personal. Si elegís iniciar
          sesión con Google (necesario solo para Noticias, la Calculadora de bonos y el reporte diario),
          recibimos de Google tu nombre, tu dirección de email y la foto de tu perfil — nada más.
        </p>
        <p>
          No hay una base de datos de usuarios: esa información vive únicamente en una cookie firmada que guarda
          tu propio navegador, para que el sitio sepa que estás logueado. No se guarda en ningún servidor ni se
          persiste en ningún otro lado.
        </p>
      </Seccion>

      <Seccion titulo="Para qué usamos esos datos">
        <p>
          Exclusivamente para identificar tu sesión y mostrarte tu nombre/foto en el menú. No se usan para
          publicidad, no se analizan, no se venden ni se comparten con nadie.
        </p>
      </Seccion>

      <Seccion titulo="Cookies">
        <p>
          El sitio usa una única cookie, necesaria para mantener tu sesión iniciada después de loguearte con
          Google. No hay cookies de analítica, seguimiento ni publicidad.
        </p>
      </Seccion>

      <Seccion titulo="Fuentes de datos de mercado">
        <p>
          Para mostrar cotizaciones y noticias, el servidor consulta APIs de terceros (IOL, BCRA, dolarapi.com,
          ArgentinaDatos, Binance, Yahoo Finance, FRED, Docta Capital, Google Noticias). Esas consultas las hace
          el servidor con sus propias credenciales — en ningún momento se les envía información tuya como
          visitante.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos">
        <p>
          Bajo la Ley 25.326 de Protección de Datos Personales, tenés derecho a acceder, rectificar o pedir la
          supresión de tus datos. En la práctica, como no guardamos nada más allá de la cookie de tu propia
          sesión, alcanza con cerrar sesión o borrar las cookies del sitio en tu navegador. Si tenés alguna duda
          igual podés escribirnos. La Agencia de Acceso a la Información Pública es el organismo de control en
          Argentina para este tema.
        </p>
      </Seccion>

      <Seccion titulo="Cambios a esta política">
        <p>
          Si cambia algo relevante en cómo se manejan los datos, se va a actualizar esta página y la fecha de
          arriba.
        </p>
      </Seccion>

      <p className="pt-2 text-xs text-muted-foreground/70">
        Ver también los{" "}
        <Link href="/terminos" className="text-accent hover:underline">
          Términos de uso
        </Link>
        .
      </p>
    </main>
  );
}
