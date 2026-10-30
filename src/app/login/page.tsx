import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Logo } from "@/components/layout/Logo";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-3 py-10 sm:px-6 sm:py-16">
      <div className="w-full rounded-2xl border border-border bg-card/60 p-5 text-center shadow-lg shadow-black/40 sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/10">
          <Logo className="h-7 w-auto" priority />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-foreground">Iniciá sesión para seguir</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Noticias, la calculadora de bonos y el reporte diario requieren una cuenta. La home queda siempre disponible sin loguearte.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
          className="mt-6"
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            <GoogleIcon />
            Continuar con Google
          </button>
        </form>
      </div>
    </main>
  );
}
