import type { Metadata } from "next";
import { ListadoNoticias, type NoticiaListado } from "@/components/noticias/ListadoNoticias";
import { getNoticiasSemana } from "@/lib/noticias/googleNews";

export const metadata: Metadata = {
  title: "Noticias",
  description: "Noticias de mercados, economía, finanzas y cripto de la última semana, con filtros por tema, medio y cobertura.",
};

async function fetchNoticias(): Promise<{ noticias: NoticiaListado[] | null; error: string | null }> {
  try {
    const noticias = await getNoticiasSemana();
    return {
      noticias: noticias.map((n) => ({
        titulo: n.titulo,
        medio: n.medio,
        url: n.url,
        fecha: n.fecha.toISOString(),
        cobertura: n.cobertura,
      })),
      error: null,
    };
  } catch (cause) {
    console.error("[noticias-pagina]", cause);
    return { noticias: null, error: "No se pudieron cargar las noticias. Probá recargar la página en unos minutos." };
  }
}

export default async function NoticiasPage() {
  const { noticias, error } = await fetchNoticias();

  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-3 px-2 py-3 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Noticias del mercado</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Fuente: Google Noticias. El número de medios indica cuántos publican el mismo hecho.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {noticias && noticias.length === 0 && (
        <p className="text-sm text-muted-foreground">No hay noticias recientes para mostrar.</p>
      )}

      {noticias && noticias.length > 0 && <ListadoNoticias noticias={noticias} />}
    </main>
  );
}
