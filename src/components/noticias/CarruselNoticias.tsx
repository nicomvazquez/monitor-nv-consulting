import Link from "next/link";
import type { CSSProperties } from "react";
import type { NoticiaListado } from "./ListadoNoticias";

const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});

/** Segundos que tarda cada tarjeta en cruzar la pantalla: más noticias, más lento el recorrido completo. */
const SEGUNDOS_POR_TARJETA = 5;

const claseTarjeta =
  "flex h-full flex-col gap-2 sm:gap-3 rounded-lg border border-border/60 bg-card p-2.5 sm:p-4 transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function Tarjeta({ noticia }: { noticia: NoticiaListado }) {
  const contenido = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[0.7rem] text-muted-foreground/70">
          {noticia.medio || "Medio"} · {formateadorFecha.format(new Date(noticia.fecha))}
        </p>
        {noticia.cobertura > 1 && (
          <span className="flex-none rounded-full bg-accent/10 px-2 py-0.5 text-[0.65rem] font-medium text-accent">
            {noticia.cobertura} medios
          </span>
        )}
      </div>
      <h3 className="line-clamp-3 text-sm leading-snug font-semibold text-foreground">{noticia.titulo}</h3>
    </>
  );

  return noticia.url ? (
    <a href={noticia.url} target="_blank" rel="noopener noreferrer" className={claseTarjeta}>
      {contenido}
    </a>
  ) : (
    <div className={claseTarjeta}>{contenido}</div>
  );
}

export function CarruselNoticias({ noticias }: { noticias: NoticiaListado[] }) {
  return (
    <section aria-labelledby="titulo-noticias-destacadas" className="flex flex-col gap-2 sm:gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="titulo-noticias-destacadas" className="text-sm font-semibold text-foreground">
            Noticias destacadas
          </h2>
        </div>
        <Link
          href="/noticias"
          className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-9"
        >
          Ver todas
        </Link>
      </div>

      {/* Mismo patrón que el carrusel de dólares: el track está duplicado (ver @keyframes marquee en globals.css)
          para que el loop sea continuo. La copia va `inert` para que no se repita al tabular ni al leer con lector de pantalla. */}
      <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <div
          className="flex w-max animate-[marquee_var(--duracion)_linear_infinite] gap-3 sm:gap-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none"
          style={{ "--duracion": `${noticias.length * SEGUNDOS_POR_TARJETA}s` } as CSSProperties}
        >
          <ul className="flex gap-3 sm:gap-4">
            {noticias.map((n) => (
              <li key={`${n.titulo}-${n.fecha}`} className="w-60 flex-none sm:w-80">
                <Tarjeta noticia={n} />
              </li>
            ))}
          </ul>
          <ul className="flex gap-3 sm:gap-4" aria-hidden="true" inert>
            {noticias.map((n) => (
              <li key={`copia-${n.titulo}-${n.fecha}`} className="w-60 flex-none sm:w-80">
                <Tarjeta noticia={n} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
