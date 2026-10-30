import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cripto",
  description: "Sección de criptomonedas de Monitor.",
};

/** Placeholder: solo el link desde el menú por ahora, sin contenido todavía. */
export default function CriptoPage() {
  return (
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-4 px-1 py-2 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Cripto</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Esta sección todavía no tiene contenido.</p>
      </div>
    </main>
  );
}
