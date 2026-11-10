import { Skeleton, SkeletonTablaCard } from "@/components/ui/Skeleton";

/** Mismo layout que `page.tsx` (sidebar + muro de paneles): Next la muestra al instante al entrar al sitio, mientras los ~15 fetchers de la home (IOL, BCRA, Binance, Yahoo, ...) todavía están en vuelo. */
export default function HomeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-2 px-6 max-sm:px-1 py-5 max-sm:py-1.5 lg:flex-row lg:items-start">
      <aside className="flex w-full flex-col gap-3 lg:w-80 lg:flex-none">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/40 shadow-sm shadow-black/30 p-3">
          <Skeleton className="h-4 w-32" />
        </div>
        <SkeletonTablaCard filas={8} />
      </aside>

      <main className="min-w-0 flex-1 columns-2 gap-4 max-sm:gap-2 sm:gap-5 xl:columns-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="mb-4 max-sm:mb-2 sm:mb-5 break-inside-avoid">
            <SkeletonTablaCard filas={i % 2 === 0 ? 7 : 5} />
          </div>
        ))}
      </main>
    </div>
  );
}
