/** Barra de título: adentro de la misma tarjeta que la tabla, no como un `<h2>` suelto arriba — así el título queda agrupado con sus datos en una sola superficie. Compartido por todas las tablas-tarjeta del sitio (cotizaciones, indicadores macro). */
export function TituloTabla({ titulo }: { titulo: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/70 px-3.5 py-2.5 max-sm:px-2.5 max-sm:py-2">
      <span aria-hidden="true" className="h-4 w-1 flex-none rounded-full bg-accent/70" />
      <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
    </div>
  );
}
