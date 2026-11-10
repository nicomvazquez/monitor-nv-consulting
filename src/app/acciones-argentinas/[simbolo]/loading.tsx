import { SkeletonFicha } from "@/components/ui/Skeleton";

export default function AccionArgentinaFichaLoading() {
  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 px-1 py-2 sm:px-6 sm:py-6">
      <SkeletonFicha secciones={5} />
    </main>
  );
}
