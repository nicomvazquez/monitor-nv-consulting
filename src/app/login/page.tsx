import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciá sesión con tu cuenta de Google para acceder a Noticias, la Calculadora de bonos y el reporte diario.",
};

/** A dónde volver después de loguearse — lo arma `proxy.ts` al redirigir acá; sin eso, vuelve a la home. */
function callbackUrlDesde(searchParams: Record<string, string | string[] | undefined>): string {
  const valor = searchParams.callbackUrl;
  const url = Array.isArray(valor) ? valor[0] : valor;
  return url && url.startsWith("/") ? url : "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sesion = await auth();
  const callbackUrl = callbackUrlDesde(await searchParams);
  if (sesion) redirect(callbackUrl);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Logo className="h-9 w-auto" priority />

      <div>
        <h1 className="text-xl font-semibold text-foreground">Iniciá sesión para seguir</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Noticias, la calculadora de bonos y el reporte diario requieren una cuenta. La home queda siempre disponible sin loguearte.
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: callbackUrl });
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          <svg viewBox="0 0 20 20" className="size-5 flex-none">
            <path
              fill="#4285F4"
              d="M19.6 10.23c0-.68-.06-1.33-.17-1.96H10v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.27Z"
            />
            <path
              fill="#34A853"
              d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H1.06v2.59A10 10 0 0 0 10 20Z"
            />
            <path fill="#FBBC05" d="M4.39 11.9A6 6 0 0 1 4.08 10c0-.66.11-1.3.31-1.9V5.51H1.06A10 10 0 0 0 0 10c0 1.61.39 3.14 1.06 4.49l3.33-2.59Z" />
            <path
              fill="#EA4335"
              d="M10 3.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87C14.95.99 12.7 0 10 0A10 10 0 0 0 1.06 5.51l3.33 2.59C5.18 5.72 7.39 3.96 10 3.96Z"
            />
          </svg>
          Continuar con Google
        </button>
      </form>
    </main>
  );
}
