"use client";

import { useMemo, useState } from "react";
import { TEMAS, temaDe, type TemaId } from "@/lib/noticias/temas";

/** Forma serializable (la fecha viaja como ISO desde el servidor). */
export interface NoticiaListado {
  titulo: string;
  medio: string;
  url?: string;
  fecha: string;
  cobertura: number;
}

const UMBRAL_MUY_CUBIERTA = 5;

const formateadorDia = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Argentina/Buenos_Aires",
});
const formateadorHora = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Argentina/Buenos_Aires",
});
const claveDia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });

const sinAcentos = (texto: string) => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const COLORES = [
  "bg-sky-500/20 text-sky-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-amber-500/20 text-amber-300",
  "bg-fuchsia-500/20 text-fuchsia-300",
  "bg-rose-500/20 text-rose-300",
  "bg-violet-500/20 text-violet-300",
];

function colorDeMedio(medio: string): string {
  let suma = 0;
  for (const letra of medio) suma += letra.charCodeAt(0);
  return COLORES[suma % COLORES.length];
}

const claseChip = (activo: boolean) =>
  `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:min-h-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
    activo ? "border-accent bg-accent/15 text-accent" : "border-border/60 text-muted-foreground hover:border-accent/50 hover:text-foreground"
  }`;

const claseCampo =
  "min-h-11 w-full rounded-lg border border-border/60 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-9";

export function ListadoNoticias({ noticias }: { noticias: NoticiaListado[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [tema, setTema] = useState<TemaId>("todos");
  const [medio, setMedio] = useState("todos");
  const [soloMuyCubiertas, setSoloMuyCubiertas] = useState(false);

  const mediosDisponibles = useMemo(
    () => [...new Set(noticias.map((n) => n.medio).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")),
    [noticias],
  );

  const conteoPorTema = useMemo(() => {
    const conteo: Record<string, number> = {};
    for (const n of noticias) {
      const t = temaDe(n.titulo);
      if (t) conteo[t] = (conteo[t] ?? 0) + 1;
    }
    return conteo;
  }, [noticias]);

  const filtradas = useMemo(() => {
    const q = sinAcentos(busqueda.trim());
    return noticias.filter(
      (n) =>
        (tema === "todos" || temaDe(n.titulo) === tema) &&
        (medio === "todos" || n.medio === medio) &&
        (!soloMuyCubiertas || n.cobertura >= UMBRAL_MUY_CUBIERTA) &&
        (q === "" || sinAcentos(`${n.titulo} ${n.medio}`).includes(q)),
    );
  }, [noticias, busqueda, tema, medio, soloMuyCubiertas]);

  const hayFiltros = busqueda !== "" || tema !== "todos" || medio !== "todos" || soloMuyCubiertas;

  const porDia = useMemo(() => {
    const mapa = new Map<string, NoticiaListado[]>();
    for (const n of filtradas) {
      const clave = claveDia.format(new Date(n.fecha));
      mapa.set(clave, [...(mapa.get(clave) ?? []), n]);
    }
    return [...mapa.entries()];
  }, [filtradas]);

  const limpiar = () => {
    setBusqueda("");
    setTema("todos");
    setMedio("todos");
    setSoloMuyCubiertas(false);
  };

  return (
    <div className="flex flex-col gap-5 max-sm:gap-3">
      <section aria-label="Filtros de noticias" className="flex flex-col gap-3 max-sm:gap-2.5 border-b border-border/50 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="buscar-noticias" className="text-xs font-medium text-muted-foreground">
              Buscar por palabra o medio
            </label>
            <div className="relative">
              <input
                id="buscar-noticias"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: riesgo país, Infobae, dólar"
                className={`${claseCampo} pr-10 [&::-webkit-search-cancel-button]:hidden`}
              />
              {busqueda !== "" && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  aria-label="Borrar búsqueda"
                  className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-56">
            <label htmlFor="filtro-medio" className="text-xs font-medium text-muted-foreground">
              Medio
            </label>
            <select
              id="filtro-medio"
              value={medio}
              onChange={(e) => setMedio(e.target.value)}
              className={claseCampo}
            >
              <option value="todos">Todos los medios</option>
              {mediosDisponibles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span id="etiqueta-temas" className="text-xs font-medium text-muted-foreground">
            Tema
          </span>
          <div role="group" aria-labelledby="etiqueta-temas" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={tema === "todos"} onClick={() => setTema("todos")} className={claseChip(tema === "todos")}>
              Todos
            </button>
            {TEMAS.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tema === t.id}
                onClick={() => setTema(t.id)}
                className={claseChip(tema === t.id)}
              >
                {t.nombre}
                <span className="text-[0.65rem] opacity-70">{conteoPorTema[t.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={soloMuyCubiertas}
            onClick={() => setSoloMuyCubiertas((v) => !v)}
            className={claseChip(soloMuyCubiertas)}
          >
            Solo hechos muy cubiertos ({UMBRAL_MUY_CUBIERTA}+ medios)
          </button>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-xs font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-8"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <p aria-live="polite" className="text-xs text-muted-foreground">
          {filtradas.length === noticias.length
            ? `${noticias.length} noticias`
            : `${filtradas.length} de ${noticias.length} noticias`}
        </p>
      </section>

      {filtradas.length === 0 && (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-border/60 px-4 py-6">
          <p className="text-sm text-foreground">No hay noticias con esos filtros.</p>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="mt-1 inline-flex min-h-11 items-center rounded-lg border border-accent/40 px-4 text-xs font-medium text-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-8"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {porDia.map(([dia, items]) => (
        <section key={dia} className="flex flex-col gap-3 max-sm:gap-2">
          <h2 className="border-b border-border/50 pb-1 text-xs font-semibold tracking-wider text-accent uppercase">
            {formateadorDia.format(new Date(items[0].fecha))}
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((n) => {
              const contenido = (
                <>
                  <div className={`flex h-20 max-sm:h-auto max-sm:w-12 max-sm:flex-none items-center justify-center text-3xl max-sm:text-xl font-bold ${colorDeMedio(n.medio || "?")}`} aria-hidden="true">
                    {(n.medio || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3 max-sm:gap-1 max-sm:p-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[0.7rem] text-muted-foreground/70">
                        {n.medio || "Medio"} · {formateadorHora.format(new Date(n.fecha))}
                      </p>
                      {n.cobertura > 1 && (
                        <span className="flex-none rounded-full bg-accent/10 px-2 py-0.5 text-[0.65rem] font-medium text-accent">
                          {n.cobertura} medios
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm leading-snug font-semibold text-foreground">{n.titulo}</h3>
                  </div>
                </>
              );
              const clases =
                "flex h-full flex-col max-sm:flex-row overflow-hidden rounded-lg border border-border/60 bg-card transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
              return (
                <li key={`${n.titulo}-${n.fecha}`}>
                  {n.url ? (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className={clases}>
                      {contenido}
                    </a>
                  ) : (
                    <div className={clases}>{contenido}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
