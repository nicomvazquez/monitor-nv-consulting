export interface BreakevenCarryTrade {
  /** Devaluación del dólar (entre hoy y el vencimiento) a la que el carry trade da exactamente cero. */
  devaluacionTotal: number;
  /** La misma devaluación, llevada a una tasa mensual compuesta — comparable con la TEM de la letra. */
  devaluacionMensual: number;
}

/**
 * Breakeven del carry trade peso con una LECAP: vender dólares hoy (al precio de
 * "compra" del dólar elegido, normalmente MEP), invertir el producido en la letra, y
 * recomprar dólares al vencimiento (al precio de "venta"). Es la devaluación del dólar
 * a la que esa vuelta a dólares da exactamente lo mismo que no haber hecho nada —
 * contempla el spread compra/venta, no solo el rendimiento de la letra, porque ese
 * spread es un costo real de la operación (se paga una vez en cada punta).
 *
 * Nota: asume que el spread compra/venta de hoy se mantiene igual al vencimiento; es
 * una simplificación habitual en este tipo de cálculo, no una proyección.
 */
export function calcularBreakevenCarryTrade(
  { rendimientoPeriodo, plazoAlVencimiento }: { rendimientoPeriodo: number | null; plazoAlVencimiento: number | null },
  dolar: { compra: number; venta: number },
): BreakevenCarryTrade | null {
  if (rendimientoPeriodo === null || plazoAlVencimiento === null || plazoAlVencimiento <= 0) return null;

  const ventaFutura = dolar.compra * (1 + rendimientoPeriodo / 100);
  const devaluacionTotal = (ventaFutura / dolar.venta - 1) * 100;
  const devaluacionMensual = (Math.pow(1 + devaluacionTotal / 100, 30 / plazoAlVencimiento) - 1) * 100;

  return { devaluacionTotal, devaluacionMensual };
}
