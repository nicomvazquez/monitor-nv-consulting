/**
 * Bloques de carga reutilizables para los `loading.tsx` de cada ruta: Next
 * los muestra al instante al navegar (antes de que el Server Component
 * termine de pedir datos a IOL/Docta/Yahoo/etc.), así la app nunca se queda
 * en blanco ni "muerta" mientras carga — ver la guía de `loading.js` en
 * `node_modules/next/dist/docs`. `animate-pulse` es una utilidad de
 * Tailwind, no hace falta CSS propio.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-foreground/10 ${className}`} />;
}

/** Imita el header + bajada de cada página (`<h1>` + párrafo) para que el salto a los datos reales no mueva el layout. */
export function SkeletonEncabezado({ conBajada = true }: { conBajada?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-6 w-56 max-w-full sm:h-7" />
      {conBajada && <Skeleton className="h-3.5 w-80 max-w-full" />}
    </div>
  );
}

/**
 * Imita un `Modulo` (tarjeta con header de ícono + título, ver `components/ui/Modulo.tsx`)
 * con `filas` barras adentro — para páginas cuyo contenido principal es una
 * tabla o un bloque de texto dentro de un módulo. Para un mapa de calor o
 * gráfico (un solo bloque visual, no filas), pasar `alto` en vez de `filas`.
 */
export function SkeletonModulo({ filas = 6, alto }: { filas?: number; alto?: string }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/40">
      <header className="flex items-center gap-2.5 border-b border-border/60 px-2.5 py-2 sm:px-5 sm:py-3">
        <Skeleton className="size-8 flex-none rounded-lg" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52 max-w-full" />
        </div>
      </header>
      <div className="p-2.5 sm:p-5">
        {alto ? (
          <Skeleton className={`w-full ${alto}`} />
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: filas }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Imita una tarjeta-tabla chica (`TituloTabla` + filas, ver `CotizacionesTable`) — las del muro de la home y los paneles compactos. */
export function SkeletonTablaCard({ filas = 6 }: { filas?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/30">
      <div className="flex items-center gap-2 border-b border-border/70 px-3.5 py-2.5">
        <Skeleton className="h-4 w-1 flex-none rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex flex-col gap-2.5 p-3">
        {Array.from({ length: filas }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Imita una ficha de análisis (acciones/cripto `[simbolo]`): link de volver + título + gráfico + grilla de secciones. */
export function SkeletonFicha({ secciones = 4 }: { secciones?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-36" />
      <SkeletonEncabezado conBajada={false} />
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[2fr_1fr]">
        <SkeletonModulo filas={1} />
        <SkeletonModulo filas={3} />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: secciones }).map((_, i) => (
          <SkeletonModulo key={i} filas={4} />
        ))}
      </div>
    </div>
  );
}
