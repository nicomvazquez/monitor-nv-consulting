"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";
import { formatPercent, formatPrice, formatVolumen } from "@/lib/format";
import type { FilaCotizacion } from "@/lib/types";
import { coloresTile } from "./colorMapaCalor";
import { agruparPorSector } from "./sectores";

/**
 * Paleta fija (no `var(--token)`): ECharts dibuja en canvas, no lee custom
 * properties CSS. El sitio es dark-mode-only (ver `globals.css`), así que
 * estos valores son simplemente la copia literal de esos tokens.
 */
const COLOR_BORDE = "#243049";
const COLOR_FONDO_TARJETA = "#0e1424";
const COLOR_TEXTO = "#f8fafc";
const COLOR_TEXTO_MUTED = "#94a3b8";

interface DatoLeaf {
  name: string;
  value: number;
  esLider: true;
  fila: FilaCotizacion;
  itemStyle: { color: string };
  label: { color: string };
}

interface DatoSector {
  name: string;
  esLider: false;
  variacionPonderada: number | null;
  cantidadAcciones: number;
  children: DatoLeaf[];
  upperLabel: { color: string; backgroundColor: string };
}

function construirDatos(datos: FilaCotizacion[]): DatoSector[] {
  return agruparPorSector(datos).map((sector): DatoSector => {
    const { texto, fondo } = coloresTile(sector.variacionPonderada);
    return {
      name: sector.sector,
      esLider: false,
      variacionPonderada: sector.variacionPonderada,
      cantidadAcciones: sector.cantidadAcciones,
      upperLabel: { color: texto, backgroundColor: fondo },
      children: sector.filas.map((fila): DatoLeaf => {
        const hoja = coloresTile(fila.variacionPorcentual);
        return {
          name: fila.simbolo,
          value: Math.max(fila.cantidadOperaciones ?? 0, 1),
          esLider: true,
          fila,
          itemStyle: { color: hoja.fondo },
          label: { color: hoja.texto },
        };
      }),
    };
  });
}

function construirOpcion(datos: FilaCotizacion[]): echarts.EChartsOption {
  return {
    backgroundColor: "transparent",
    tooltip: {
      backgroundColor: COLOR_FONDO_TARJETA,
      borderColor: COLOR_BORDE,
      textStyle: { color: COLOR_TEXTO, fontSize: 12 },
      extraCssText: "border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.4);",
      formatter: (params) => {
        const info = params as unknown as { data: DatoLeaf | DatoSector };
        const d = info.data;
        if (d.esLider) {
          const { fila } = d;
          const colorVariacion = (fila.variacionPorcentual ?? 0) < 0 ? "#f87171" : "#34d399";
          return `
            <div style="font-weight:600">${fila.simbolo} <span style="font-weight:400;color:${COLOR_TEXTO_MUTED}">— ${fila.descripcion}</span></div>
            <div style="margin-top:4px;color:${COLOR_TEXTO_MUTED}">Cierre: <span style="color:${COLOR_TEXTO}">${fila.ultimoPrecio !== null ? formatPrice(fila.ultimoPrecio) : "s/d"}</span></div>
            <div style="color:${COLOR_TEXTO_MUTED}">Variación: <span style="color:${colorVariacion}">${fila.variacionPorcentual !== null ? formatPercent(fila.variacionPorcentual) : "s/d"}</span></div>
            <div style="color:${COLOR_TEXTO_MUTED}">Operaciones: <span style="color:${COLOR_TEXTO}">${fila.cantidadOperaciones ? formatVolumen(fila.cantidadOperaciones) : "s/d"}</span></div>
          `;
        }
        const colorVariacion = (d.variacionPonderada ?? 0) < 0 ? "#f87171" : "#34d399";
        return `
          <div style="font-weight:600">${d.name} <span style="font-weight:400;color:${COLOR_TEXTO_MUTED}">— ${d.cantidadAcciones} ${d.cantidadAcciones === 1 ? "acción" : "acciones"}</span></div>
          <div style="margin-top:4px;color:${COLOR_TEXTO_MUTED}">Variación ponderada: <span style="color:${colorVariacion}">${d.variacionPonderada !== null ? formatPercent(d.variacionPonderada) : "s/d"}</span></div>
        `;
      },
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        animationDurationUpdate: 300,
        label: {
          show: true,
          formatter: (params) => {
            const info = params as unknown as { data: DatoLeaf };
            if (!info.data.esLider) return "";
            const pct = info.data.fila.variacionPorcentual;
            return `{simbolo|${info.data.fila.simbolo}}${pct !== null ? `\n{pct|${formatPercent(pct)}}` : ""}`;
          },
          rich: {
            simbolo: { fontWeight: 700, fontSize: 13, lineHeight: 16 },
            pct: { fontSize: 11, lineHeight: 14, opacity: 0.9 },
          },
        },
        itemStyle: { borderColor: COLOR_BORDE, gapWidth: 2 },
        // El root invisible (profundidad 0) también hereda este default y,
        // si no se apaga ahí, ECharts dibuja una sola franja superior para
        // TODO el treemap en vez de una por sector — por eso `levels[0]`
        // la apaga explícitamente y sólo `levels[1]` (sectores) la prende.
        upperLabel: {
          show: false,
          height: 24,
          fontWeight: 600,
          fontSize: 12,
          formatter: (params) => {
            const info = params as unknown as { data: DatoSector };
            const pct = info.data.variacionPonderada;
            return `${info.data.name}${pct !== null ? `  ${formatPercent(pct)}` : ""}`;
          },
        },
        levels: [
          { upperLabel: { show: false } },
          {
            itemStyle: { color: COLOR_FONDO_TARJETA, borderColor: COLOR_BORDE, borderWidth: 2, gapWidth: 3 },
            upperLabel: { show: true },
          },
          {
            itemStyle: { borderColor: "#020617", borderWidth: 1, gapWidth: 1 },
            upperLabel: { show: false },
          },
        ],
        data: construirDatos(datos),
      },
    ],
  };
}

export function MapaCalorAcciones({ datos }: { datos: FilaCotizacion[] }) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!contenedorRef.current) return;
    const chart = echarts.init(contenedorRef.current, undefined, { renderer: "svg" });
    chartRef.current = chart;

    const observador = new ResizeObserver(() => chart.resize());
    observador.observe(contenedorRef.current);

    return () => {
      observador.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(construirOpcion(datos), true);
  }, [datos]);

  if (datos.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay datos de Panel Líder disponibles.</p>;
  }

  return <div ref={contenedorRef} className="aspect-[3/4] w-full sm:aspect-[16/9]" />;
}
