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
