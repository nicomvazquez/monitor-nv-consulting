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
