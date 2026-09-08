/** Forma real de cada elemento de GET https://dolarapi.com/v1/dolares. */
export interface Dolar {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}
