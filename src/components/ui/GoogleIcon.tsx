/** Marca oficial de Google (4 colores) — no la versión monocromática genérica de un set de íconos: usar esa para "Continuar con Google" rompe las guías de marca de Google. */
export function GoogleIcon({ className = "size-5 flex-none" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M19.6 10.23c0-.68-.06-1.33-.17-1.96H10v3.71h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.27Z"
      />
      <path
        fill="#34A853"
        d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H1.06v2.59A10 10 0 0 0 10 20Z"
      />
      <path fill="#FBBC05" d="M4.39 11.9A6 6 0 0 1 4.08 10c0-.66.11-1.3.31-1.9V5.51H1.06A10 10 0 0 0 0 10c0 1.61.39 3.14 1.06 4.49l3.33-2.59Z" />
      <path
        fill="#EA4335"
        d="M10 3.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87C14.95.99 12.7 0 10 0A10 10 0 0 0 1.06 5.51l3.33 2.59C5.18 5.72 7.39 3.96 10 3.96Z"
      />
    </svg>
  );
}
