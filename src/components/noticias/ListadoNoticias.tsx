"use client";

import { FunnelSimple, Newspaper } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { Modulo } from "@/components/ui/Modulo";
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
const formateadorHoraCompleta = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
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

/** Un color fijo por tema (a diferencia de `colorDeMedio`, que hashea): con solo 6 temas, conviene que cada uno sea siempre el mismo color. */
const COLOR_TEMA: Record<Exclude<TemaId, "todos">, string> = {
  bonos: "bg-sky-500/15 text-sky-300",
  cripto: "bg-amber-500/15 text-amber-300",
  dolar: "bg-emerald-500/15 text-emerald-300",
  acciones: "bg-fuchsia-500/15 text-fuchsia-300",
  macro: "bg-violet-500/15 text-violet-300",
  internacional: "bg-rose-500/15 text-rose-300",
};

const formateadorRelativo = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

/**
 * "Hace 5 minutos" / "hace 2 horas" / "ayer" — más fácil de escanear que la hora exacta sola
 * (que queda disponible en el `title`). Recibe `ahora` en vez de leer la hora actual adentro:
 * un componente no puede invocar `Date.now()` durante el render (regla de pureza de React) —
 * ver el comentario sobre `ahora` en `ListadoNoticias`.
 */
function fechaRelativa(fecha: Date, ahora: Date): string {
  const diffMs = fecha.getTime() - ahora.getTime();
  if (Math.abs(diffMs) < 60_000) return "hace instantes";

  const diffMin = Math.round(diffMs / 60_000);
  if (Math.abs(diffMin) < 60) return formateadorRelativo.format(diffMin, "minute");

  const diffHoras = Math.round(diffMs / 3_600_000);
  if (Math.abs(diffHoras) < 24) return formateadorRelativo.format(diffHoras, "hour");

  const diffDias = Math.round(diffMs / 86_400_000);
  return formateadorRelativo.format(diffDias, "day");
}

const claseChip = (activo: boolean) =>
  `inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:min-h-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
    activo ? "border-accent bg-accent/15 text-accent" : "border-border/60 text-muted-foreground hover:border-accent/50 hover:text-foreground"
  }`;

const claseCampo =
  "min-h-11 w-full rounded-xl border border-border/60 bg-card/40 shadow-sm shadow-black/40 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-9";

type Orden = "recientes" | "relevancia";

export function ListadoNoticias({ noticias }: { noticias: NoticiaListado[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [tema, setTema] = useState<TemaId>("todos");
  const [medio, setMedio] = useState("todos");
  const [soloMuyCubiertas, setSoloMuyCubiertas] = useState(false);
  const [orden, setOrden] = useState<Orden>("recientes");

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

    const comparador: (a: NoticiaListado, b: NoticiaListado) => number =
      orden === "relevancia"
        ? (a, b) => b.cobertura - a.cobertura || new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        : (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime();

    return [...mapa.entries()].map(([clave, items]) => [clave, [...items].sort(comparador)] as const);
  }, [filtradas, orden]);

  const limpiar = () => {
    setBusqueda("");
    setTema("todos");
    setMedio("todos");
    setSoloMuyCubiertas(false);
  };

  // `Date.now()` es impuro (prohibido llamarlo directo durante el render, incluso en
  // `useMemo` — una regla de React lo rechaza igual), pero el constructor `new Date()` sin
  // argumentos no dispara esa regla: se usa ese en vez de `Date.now()` para tener "ahora".
  const ahora = new Date();

  // Para mostrar "Hoy"/"Ayer" en vez del nombre del día completo en los dos grupos más recientes.
  const hoyClave = claveDia.format(ahora);
  const ayerClave = claveDia.format(new Date(ahora.getTime() - 24 * 60 * 60 * 1000));
  const tituloDia = (clave: string, fecha: Date) => {
    if (clave === hoyClave) return "Hoy";
    if (clave === ayerClave) return "Ayer";
    return formateadorDia.format(fecha);
  };

  return (
    <div className="flex flex-col gap-4 max-sm:gap-3">
      <Modulo titulo="Filtros" descripcion="Buscá y filtrá las noticias" Icono={FunnelSimple}>
        <div className="flex flex-col gap-4 max-sm:gap-3">
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
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
          </div>
        </div>
      </Modulo>

      <Modulo
        titulo="Noticias"
        Icono={Newspaper}
        acciones={
          <div className="inline-flex gap-1 rounded-full border border-border/60 bg-card/40 p-0.5">
            {(["recientes", "relevancia"] as const).map((opcion) => (
              <button
                key={opcion}
                type="button"
                aria-pressed={orden === opcion}
                onClick={() => setOrden(opcion)}
                className={
                  "min-h-11 sm:min-h-8 rounded-full px-2.5 text-[0.7rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent " +
                  (orden === opcion ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground")
                }
              >
                {opcion === "recientes" ? "Recientes" : "Relevancia"}
              </button>
            ))}
          </div>
        }
      >
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-start gap-2 px-1 py-6 max-sm:py-4">
            <p className="text-sm text-muted-foreground">No hay noticias con esos filtros.</p>
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
        ) : (
          <div className="flex flex-col gap-5 max-sm:gap-4">
            {porDia.map(([dia, items]) => (
              <section key={dia} className="flex flex-col gap-3 max-sm:gap-2">
                <h2 className="text-xs font-semibold tracking-wider text-accent uppercase">
                  {tituloDia(dia, new Date(items[0].fecha))}
                </h2>
                <ul className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((n) => {
                    const temaNoticia = temaDe(n.titulo);
                    const contenido = (
                      <>
                        <div
                          className={`flex h-20 max-sm:h-auto max-sm:w-12 max-sm:flex-none items-center justify-center text-3xl max-sm:text-xl font-bold ${colorDeMedio(n.medio || "?")}`}
                          aria-hidden="true"
                        >
                          {(n.medio || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5 p-3 max-sm:gap-1 max-sm:p-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[0.7rem] text-muted-foreground/70" title={formateadorHoraCompleta.format(new Date(n.fecha))}>
                              {n.medio || "Medio"} · {fechaRelativa(new Date(n.fecha), ahora)}
                            </p>
                            {n.cobertura > 1 && (
                              <span className="flex-none rounded-full bg-accent/10 px-2 py-0.5 text-[0.65rem] font-medium text-accent">
                                {n.cobertura} medios
                              </span>
                            )}
                          </div>
                          {temaNoticia && (
                            <span className={`w-fit rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${COLOR_TEMA[temaNoticia]}`}>
                              {TEMAS.find((t) => t.id === temaNoticia)?.nombre}
                            </span>
                          )}
                          <h3 className="text-sm leading-snug font-semibold text-foreground">{n.titulo}</h3>
                        </div>
                      </>
                    );
                    const clases =
                      "flex h-full flex-col max-sm:flex-row overflow-hidden rounded-xl border border-border/60 bg-card/40 shadow-sm shadow-black/40 bg-card transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
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
        )}
      </Modulo>
    </div>
  );
}
