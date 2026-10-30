/** Marca de error compartida por todas las secciones (paneles de cotizaciones, macro, caución, dólares). */
export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 max-sm:px-2.5 max-sm:py-2">
      {children}
    </div>
  );
}
