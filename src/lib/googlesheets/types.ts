/** Una fila de la hoja de bonos, ya tipada (los valores llegan como texto desde el CSV). */
export interface BonoFila {
  /** Título de sección tal como está en la hoja (ej. "ley local", "ley new york"). */
  seccion: string;
  ticker: string;
  precioUsd: number | null;
  /** Porcentaje ya como número (ej. 7.34 para "7,34%"). */
  tir: number | null;
  /** Fecha tal como viene en la hoja (ej. "9/01/2027"); no se parsea, solo se muestra. */
  proximoPago: string;
  diasAlProximoPago: number | null;
  valorPago: number | null;
  duration: number | null;
  durationModificada: number | null;
  convexidad: number | null;
}

/**
 * Una LECAP de la hoja del usuario, ya tipada. A diferencia de `BonoFila`,
 * la hoja de origen trae los datos "transpuestos" (cada columna es una
 * LECAP, cada fila una métrica) — ver `getLecapsSheet`.
 */
export interface LecapFila {
  ticker: string;
  valorNominal: number | null;
  /** Fecha tal como viene en la hoja (ej. "31-oct-2025"); no se parsea, solo se muestra. */
  fechaEmision: string;
  fechaVencimiento: string;
  /** Plazo total de la letra en días, desde la emisión. */
  plazoOriginal: number | null;
  /** Tasa a la que se licitó originalmente. */
  tasaLicitada: number | null;
  /** Valor que paga al vencimiento cada 100 de valor nominal. */
  valorPagoVencimiento: number | null;
  /** Días que faltan para el vencimiento, desde hoy. */
  plazoAlVencimiento: number | null;
  precioCompra: number | null;
  /** Rendimiento total del período restante (no anualizado). */
  rendimientoPeriodo: number | null;
  /** TIR anualizada. */
  tir: number | null;
  /** Tasa efectiva mensual (TEM). */
  tasaEfectivaMensual: number | null;
}
