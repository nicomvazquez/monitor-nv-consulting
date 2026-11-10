/** Spinner chico para botones/mensajes en vuelo (descarga del reporte, cambio de bono en la calculadora de TIR, etc.) — complementa a los `loading.tsx` por ruta, que no cubren estados que no son de navegación. */
export function Spinner({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12H4Z" />
    </svg>
  );
}
