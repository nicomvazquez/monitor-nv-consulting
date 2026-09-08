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
