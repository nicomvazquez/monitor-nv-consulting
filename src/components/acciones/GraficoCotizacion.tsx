"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { PuntoPrecio } from "@/lib/yahoofinance/fundamentals";

const ANCHO = 640;
const ALTO = 220;
const PADDING_IZQ = 56;
const PADDING_DER = 12;
const PADDING_ARRIBA = 16;
const PADDING_ABAJO = 28;
const CANTIDAD_GRIDLINES = 4;

function escalar(valor: number, min: number, max: number, destinoMin: number, destinoMax: number): number {
  if (max === min) return (destinoMin + destinoMax) / 2;
  return destinoMin + ((valor - min) / (max - min)) * (destinoMax - destinoMin);
}

const formateadorFecha = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" });

/**
 * Cotización en el tiempo: una sola serie (el cierre diario), así que va en
 * el color de acento sin leyenda — el título ya dice qué se está graficando.
 * Eje X por índice, no por fecha real: `historial` ya viene filtrado a solo
 * ruedas con operaciones, así que no hay huecos de fin de semana que salvar.
 * Línea + área al 10% de opacidad (una sola serie), con crosshair al pasar
 * el mouse o el dedo — el punto es el objetivo de interacción, no una línea
 * de 2px.
 */
export function GraficoCotizacion({ historial }: { historial: PuntoPrecio[] }) {
  const [indiceActivo, setIndiceActivo] = useState<number | null>(null);

  if (historial.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay suficiente historial de Yahoo Finance para graficar esta acción.
      </p>
    );
  }

  const cierres = historial.map((p) => p.cierre);
  const minCierre = Math.min(...cierres);
  const maxCierre = Math.max(...cierres);
  const margen = (maxCierre - minCierre) * 0.08 || 1;
  const desde = minCierre - margen;
  const hasta = maxCierre + margen;

  const escalarX = (i: number) => escalar(i, 0, historial.length - 1, PADDING_IZQ, ANCHO - PADDING_DER);
  const escalarY = (valor: number) => escalar(valor, desde, hasta, ALTO - PADDING_ABAJO, PADDING_ARRIBA);

  const coords = historial.map((p, i) => ({ x: escalarX(i), y: escalarY(p.cierre) }));

  const linea = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const area = `${linea} L${coords[coords.length - 1].x},${ALTO - PADDING_ABAJO} L${coords[0].x},${ALTO - PADDING_ABAJO} Z`;

  const gridY = Array.from({ length: CANTIDAD_GRIDLINES + 1 }, (_, i) => {
    const valor = desde + ((hasta - desde) * i) / CANTIDAD_GRIDLINES;
    return { valor, y: escalarY(valor) };
  });

  const primero = historial[0];
  const ultimo = historial[historial.length - 1];
  const variacionPeriodo = ((ultimo.cierre - primero.cierre) / primero.cierre) * 100;
  const activo = indiceActivo !== null ? historial[indiceActivo] : null;
  const coordActivo = indiceActivo !== null ? coords[indiceActivo] : null;

  function manejarPuntero(evento: React.PointerEvent<SVGSVGElement>) {
    const rect = evento.currentTarget.getBoundingClientRect();
    const xRelativo = ((evento.clientX - rect.left) / rect.width) * ANCHO;
    let masCercano = 0;
    let distanciaMinima = Infinity;
    coords.forEach((c, i) => {
      const distancia = Math.abs(c.x - xRelativo);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        masCercano = i;
      }
    });
    setIndiceActivo(masCercano);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-muted-foreground">Cotización — últimos 6 meses</p>
        <p className={"font-mono text-xs font-medium tabular-nums " + (variacionPeriodo >= 0 ? "text-emerald-400" : "text-red-400")}>
          {variacionPeriodo >= 0 ? "+" : ""}
          {variacionPeriodo.toFixed(2)}% en el período
        </p>
      </div>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label={`Cotización de los últimos 6 meses, de ${formatPrice(primero.cierre)} a ${formatPrice(ultimo.cierre)}`}
        onPointerMove={manejarPuntero}
        onPointerLeave={() => setIndiceActivo(null)}
      >
        {gridY.map(({ valor, y }) => (
          <g key={valor}>
            <line x1={PADDING_IZQ} y1={y} x2={ANCHO - PADDING_DER} y2={y} className="stroke-border" strokeWidth={1} />
            <text x={PADDING_IZQ - 8} y={y} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[0.6rem]">
              {formatPrice(valor)}
            </text>
          </g>
        ))}

        <path d={area} className="fill-accent/10" stroke="none" />
        <path d={linea} fill="none" className="stroke-accent" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        <text x={PADDING_IZQ} y={ALTO - 6} textAnchor="start" className="fill-muted-foreground text-[0.6rem]">
          {formateadorFecha.format(new Date(primero.fecha))}
        </text>
        <text x={ANCHO - PADDING_DER} y={ALTO - 6} textAnchor="end" className="fill-muted-foreground text-[0.6rem]">
          {formateadorFecha.format(new Date(ultimo.fecha))}
        </text>

        {coordActivo && activo && (
          <g>
            <line
              x1={coordActivo.x}
              y1={PADDING_ARRIBA}
              x2={coordActivo.x}
              y2={ALTO - PADDING_ABAJO}
              className="stroke-muted-foreground"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <circle cx={coordActivo.x} cy={coordActivo.y} r={4} className="fill-accent stroke-background" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      <div className="flex min-h-5 items-center justify-center text-xs">
        {activo ? (
          <p className="font-mono tabular-nums text-foreground">
            {formateadorFecha.format(new Date(activo.fecha))} — <span className="font-semibold">{formatPrice(activo.cierre)}</span>
          </p>
        ) : (
          <p className="text-muted-foreground/60">Pasá el mouse para ver el detalle de cada rueda</p>
        )}
      </div>
    </div>
  );
}
