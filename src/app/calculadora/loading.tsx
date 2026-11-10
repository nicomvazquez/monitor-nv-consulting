import { Skeleton, SkeletonModulo } from "@/components/ui/Skeleton";

export default function CalculadoraLoading() {
  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-8 max-sm:gap-4 px-6 max-sm:px-1 py-8 max-sm:py-2">
      <Skeleton className="h-6 w-32 sm:h-7" />
      <SkeletonModulo filas={6} />
    </main>
  );
}
