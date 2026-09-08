import { parseCsv } from "@/lib/csv";
import { BONOS_SHEET_CSV_URL, REVALIDATE_SECONDS_BONOS_SHEET } from "./config";
import type { BonoFila } from "./types";

const CLAVE_HEADER = "ticker";

/** Formato numérico argentino (coma decimal): "7,34%" -> 7.34, "54,4" -> 54.4, "" -> null. */
function parseNumeroAr(valor: string | undefined): number | null {
  if (!valor) return null;
  const limpio = valor.trim().replace(/%$/, "").replace(",", ".");
  if (limpio === "") return null;
  const numero = Number(limpio);
  return Number.isNaN(numero) ? null : numero;
}

/**
 * La hoja no es una tabla única: son bloques separados por filas en blanco,
 * cada uno con su propio título de sección ("ley local", "ley new york") y
 * su propia fila de encabezado ("ticker, precio USD/c100, TIR, ..."). Se
 * detecta el encabezado buscando la celda "ticker" en vez de asumir una
 * columna fija, porque la hoja trae una columna A vacía de por medio.
 */
export async function getBonosSheet(): Promise<BonoFila[]> {
  const response = await fetch(BONOS_SHEET_CSV_URL, {
    next: { revalidate: REVALIDATE_SECONDS_BONOS_SHEET },
  });

  if (!response.ok) {
    throw new Error(`Pedido a Google Sheets falló (${response.status} ${response.statusText})`);
  }

  const filasCsv = parseCsv(await response.text());
  const filas: BonoFila[] = [];
  let seccionActual = "";
  let indiceTicker = -1;

  for (const filaCsv of filasCsv) {
    const celdas = filaCsv.map((c) => c.trim());
    const noVacias = celdas.filter((c) => c !== "");

    if (noVacias.length === 0) continue; // fila separadora entre bloques

    if (noVacias.length === 1 && noVacias[0].toLowerCase() !== CLAVE_HEADER) {
      seccionActual = noVacias[0];
      indiceTicker = -1; // el próximo encabezado define de nuevo la columna
      continue;
    }

    const inicioTicker = celdas.findIndex((c) => c.toLowerCase() === CLAVE_HEADER);
    if (inicioTicker !== -1) {
      indiceTicker = inicioTicker;
      continue;
    }

    if (indiceTicker === -1 || !celdas[indiceTicker]) continue; // todavía sin header visto, o fila vacía en esa columna

    filas.push({
      seccion: seccionActual,
      ticker: celdas[indiceTicker],
      precioUsd: parseNumeroAr(celdas[indiceTicker + 1]),
      tir: parseNumeroAr(celdas[indiceTicker + 2]),
      proximoPago: celdas[indiceTicker + 3] ?? "",
      diasAlProximoPago: parseNumeroAr(celdas[indiceTicker + 4]),
      valorPago: parseNumeroAr(celdas[indiceTicker + 5]),
      duration: parseNumeroAr(celdas[indiceTicker + 6]),
      durationModificada: parseNumeroAr(celdas[indiceTicker + 7]),
      convexidad: parseNumeroAr(celdas[indiceTicker + 8]),
    });
  }

  return filas;
}
