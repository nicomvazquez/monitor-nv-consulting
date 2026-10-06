import Image from "next/image";

/**
 * `width`/`height` son las dimensiones intrínsecas reales del archivo
 * (500x300, PNG con fondo transparente) — Next las usa para calcular el
 * aspect-ratio y evitar layout shift mientras carga. El tamaño mostrado lo
 * define `className` (alto fijo, ancho automático).
 */
export function Logo({ className = "h-7 w-auto", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="Cotizaciones"
      width={500}
      height={300}
      priority={priority}
      className={`flex-none object-contain ${className}`}
    />
  );
}
