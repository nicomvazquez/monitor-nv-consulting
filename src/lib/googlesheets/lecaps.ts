import { parseCsv, parseNumeroAr } from "@/lib/csv";
import { LECAPS_SHEET_CSV_URL, REVALIDATE_SECONDS_BONOS_SHEET } from "./config";
import type { LecapFila } from "./types";

/**
 * Qué campo de `LecapFila` llena cada fila de la hoja, identificado por el
 * texto de su etiqueta (columna B) en vez de por posición — la hoja la edita
 * el usuario a mano y puede traer alguna variación de tipeo (ej. "venimiento"
 * en vez de "vencimiento"), así que cada patrón es tolerante a eso.
 * `texto: true` deja el valor como string (fechas); el resto se parsea como
 * número con `parseNumeroAr`.
 */
const CAMPOS: { patron: RegExp; campo: keyof LecapFila; texto?: boolean }[] = [
  { patron: /^valor nominal/, campo: "valorNominal" },
  { patron: /^fecha emisi/, campo: "fechaEmision", texto: true },
  { patron: /^fecha ven\w*iento/, campo: "fechaVencimiento", texto: true },
  { patron: /^plazo original/, campo: "plazoOriginal" },
  { patron: /^tasa licitada/, campo: "tasaLicitada" },
  { patron: /^valor de pago/, campo: "valorPagoVencimiento" },
  { patron: /^plazo al ven/, campo: "plazoAlVencimiento" },
  { patron: /^precio de compra/, campo: "precioCompra" },
  { patron: /^rendimiento del per/, campo: "rendimientoPeriodo" },
  { patron: /^tir$/, campo: "tir" },
  { patron: /^tasa efectiva mensual/, campo: "tasaEfectivaMensual" },
];

/**
 * A diferencia de la hoja de bonos, esta viene "transpuesta": la columna A
 * está vacía, la B tiene la etiqueta de cada métrica, y de la C en adelante
 * hay una columna por LECAP. La fila "ticker" define cuántas LECAPs hay y en
 * qué columna está cada una; el resto de las filas van completando esos
 * mismos índices de columna, fila por fila.
 */
export async function getLecapsSheet(): Promise<LecapFila[]> {
  const response = await fetch(LECAPS_SHEET_CSV_URL, {
    next: { revalidate: REVALIDATE_SECONDS_BONOS_SHEET },
  });

  if (!response.ok) {
    throw new Error(`Pedido a Google Sheets falló (${response.status} ${response.statusText})`);
  }

  const filasCsv = parseCsv(await response.text());
  const parciales: Partial<LecapFila>[] = [];

  for (const filaCsv of filasCsv) {
    const celdas = filaCsv.map((c) => c.trim());
    const etiqueta = (celdas[1] ?? "").toLowerCase();
    if (!etiqueta) continue; // fila separadora

    if (etiqueta === "ticker") {
      celdas.slice(2).forEach((ticker, i) => {
        if (ticker) parciales[i] = { ticker };
      });
      continue;
    }

    const campo = CAMPOS.find(({ patron }) => patron.test(etiqueta));
    if (!campo) continue; // fila de la hoja que no reconocemos: se ignora en vez de romper todo

    celdas.slice(2).forEach((valor, i) => {
      const fila = parciales[i];
      if (!fila) return; // columna sin ticker (ej. una columna vacía entre letras)
      (fila as Record<string, unknown>)[campo.campo] = campo.texto ? valor : parseNumeroAr(valor);
    });
  }

  return parciales.filter((f): f is LecapFila => Boolean(f.ticker));
}
