"use client";

import { useMemo, useState } from "react";
import type { ObligacionNegociable } from "@/lib/docta/obligacionesNegociables";

const sinAcentos = (texto: string) => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const TODOS = "todos";

const claseCampo =
  "min-h-11 w-full rounded-xl border border-border/60 bg-card/40 shadow-sm shadow-black/40 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-9";

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="whitespace-nowrap px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 text-left text-[0.7rem] font-semibold tracking-wide text-accent uppercase">
      {children}
    </th>
  );
}

function Td({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className={"whitespace-nowrap px-2.5 py-1.5 max-sm:px-2 max-sm:py-1 " + (muted ? "text-muted-foreground" : "text-foreground/90")}>
      {children}
    </td>
  );
}

/** Opciones de un filtro: valores únicos presentes en los datos, ordenados alfabéticamente. */
function opcionesDe(obligaciones: ObligacionNegociable[], campo: keyof ObligacionNegociable): string[] {
  return [...new Set(obligaciones.map((o) => o[campo]))].sort((a, b) => a.localeCompare(b, "es"));
}

export function TablaObligacionesNegociables({ obligaciones }: { obligaciones: ObligacionNegociable[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [sector, setSector] = useState(TODOS);
  const [emisor, setEmisor] = useState(TODOS);
  const [ley, setLey] = useState(TODOS);

  const sectores = useMemo(() => opcionesDe(obligaciones, "sector"), [obligaciones]);
  const emisores = useMemo(() => opcionesDe(obligaciones, "emisor"), [obligaciones]);
  const leyes = useMemo(() => opcionesDe(obligaciones, "ley"), [obligaciones]);

  const filtradas = useMemo(() => {
    const q = sinAcentos(busqueda.trim());
    return obligaciones.filter(
      (o) =>
        (sector === TODOS || o.sector === sector) &&
        (emisor === TODOS || o.emisor === emisor) &&
        (ley === TODOS || o.ley === ley) &&
        (q === "" || sinAcentos(`${o.ticker} ${o.nombre}`).includes(q)),
    );
  }, [obligaciones, busqueda, sector, emisor, ley]);

  const hayFiltros = busqueda !== "" || sector !== TODOS || emisor !== TODOS || ley !== TODOS;

  const limpiar = () => {
    setBusqueda("");
    setSector(TODOS);
    setEmisor(TODOS);
    setLey(TODOS);
  };

  return (
    <div className="flex flex-col gap-3">
      <section aria-label="Filtros de obligaciones negociables" className="flex flex-col gap-3 max-sm:gap-2.5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="buscar-on" className="text-xs font-medium text-muted-foreground">
              Buscar por ticker o nombre
            </label>
            <input
              id="buscar-on"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej: YPF, PECNC, Pampa"
              className={`${claseCampo} [&::-webkit-search-cancel-button]:hidden`}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:w-48">
            <label htmlFor="filtro-sector" className="text-xs font-medium text-muted-foreground">
              Sector
            </label>
            <select id="filtro-sector" value={sector} onChange={(e) => setSector(e.target.value)} className={claseCampo}>
              <option value={TODOS}>Todos</option>
              {sectores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-56">
            <label htmlFor="filtro-emisor" className="text-xs font-medium text-muted-foreground">
              Emisor
            </label>
            <select id="filtro-emisor" value={emisor} onChange={(e) => setEmisor(e.target.value)} className={claseCampo}>
              <option value={TODOS}>Todos</option>
              {emisores.map((e2) => (
                <option key={e2} value={e2}>
                  {e2}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-36">
            <label htmlFor="filtro-ley" className="text-xs font-medium text-muted-foreground">
              Ley
            </label>
            <select id="filtro-ley" value={ley} onChange={(e) => setLey(e.target.value)} className={claseCampo}>
              <option value={TODOS}>Todas</option>
              {leyes.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {filtradas.length === obligaciones.length
              ? `${obligaciones.length} obligaciones negociables`
              : `${filtradas.length} de ${obligaciones.length} obligaciones negociables`}
          </p>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex min-h-9 items-center rounded-full px-2 text-xs font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </section>

      {filtradas.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-border/50 px-3 py-8 max-sm:px-2.5 max-sm:py-6">
          <p className="text-sm text-muted-foreground">No hay obligaciones negociables con esos filtros.</p>
        </div>
      ) : (
        <div className="scrollbar-accent overflow-x-auto rounded-lg border border-border/50">
          <table className="min-w-full divide-y divide-border/50 text-left text-xs sm:text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr>
                <Th>Ticker</Th>
                <Th>Nombre</Th>
                <Th>Sector</Th>
                <Th>Emisor</Th>
                <Th>Ley</Th>
                <Th>ISIN</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtradas.map((o) => (
                <tr key={o.ticker} className="transition-colors hover:bg-accent/5">
                  <Td>
                    <span className="font-mono font-semibold text-foreground">{o.ticker}</span>
                  </Td>
                  <Td muted>{o.nombre}</Td>
                  <Td muted>{o.sector}</Td>
                  <Td muted>{o.emisor}</Td>
                  <Td muted>{o.ley}</Td>
                  <Td muted>
                    <span className="font-mono text-[0.7rem]">{o.isin}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
