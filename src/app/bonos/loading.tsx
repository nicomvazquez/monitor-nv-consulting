import { Skeleton, SkeletonModulo } from "@/components/ui/Skeleton";

export default function BonosLoading() {
  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-8 max-sm:gap-4 px-6 max-sm:px-1 py-8 max-sm:py-2">
      <Skeleton className="h-6 w-24 sm:h-7" />

      <div className="flex gap-2">
        <Skeleton className="h-9 w-32 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      <SkeletonModulo filas={10} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SkeletonModulo alto="h-56" />
        <SkeletonModulo alto="h-56" />
      </div>
    </main>
  );
}
