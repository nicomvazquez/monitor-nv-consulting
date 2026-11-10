import { Skeleton, SkeletonModulo } from "@/components/ui/Skeleton";

export default function AnalisisAccionesLoading() {
  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6 max-sm:gap-3 px-1 py-2 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-6 w-56 sm:h-7" />
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
      <SkeletonModulo alto="h-96" />
      <SkeletonModulo filas={10} />
    </main>
  );
}
