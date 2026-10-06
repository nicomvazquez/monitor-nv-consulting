/**
 * Forma mínima que necesita `CotizacionesTable` (Símbolo/Último/Variación).
 * No es específica de ninguna fuente de datos: la usan los paneles de IOL
 * (acciones/bonos/CEDEARs), caución y criptomonedas por igual.
 */
export interface FilaCotizacion {
  simbolo: string;
  descripcion: string;
  ultimoPrecio: number | null;
  variacionPorcentual: number | null;
  /** Opcional: no todas las fuentes lo tienen (ej. caución). En pesos/dólares/USDT según el panel. */
  volumen?: number | null;
}

/**
 * Fila genérica para paneles "tipo lista" (nombre + valor + fecha, sin
 * columnas de tabla) — el mismo formato visual que `MacroCard`, pero sin
 * atarse a la forma de la respuesta del BCRA. `valor` ya viene formateado
 * como texto (ej. "3,63%", "US$ 23.218 MM") porque cada fuente sabe mejor
 * que nadie cómo mostrar su propio dato.
 */
export interface FilaIndicador {
  nombre: string;
  valor: string;
  fecha: string;
}

/**
 * Cómo mostrar el precio de una cotización con concepto de mercado
 * abierto/cerrado (IOL, Yahoo Finance): "auto" sigue el horario real del
 * mercado (en vivo mientras opera, cierre una vez terminada la rueda — el
 * comportamiento de siempre en la home); "cierre" fuerza siempre el último
 * cierre real, sin importar si el mercado está operando en este momento —
 * lo usa el reporte en PDF, que nunca debe mostrar un precio en vivo.
 */
export type ModoPrecio = "auto" | "cierre";
