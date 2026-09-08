export interface IolTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  ".issued": string;
  ".expires": string;
}

export interface PuntaCotizacion {
  cantidadCompra: number | null;
  precioCompra: number | null;
  precioVenta: number | null;
  cantidadVenta: number | null;
}

/**
 * Forma real (verificada a mano) de cada elemento dentro de `titulos` en la
 * respuesta de GET /api/v2/Cotizaciones/{instrumento}/{panel}/{pais}.
 */
export interface CotizacionPanelItem {
  simbolo: string;
  descripcion: string;
  ultimoPrecio: number;
  variacionPorcentual: number;
  apertura: number;
  maximo: number;
  minimo: number;
  ultimoCierre: number;
  volumen: number;
  cantidadOperaciones: number;
  fecha: string;
  mercado: string;
  moneda: string;
  puntas: PuntaCotizacion;
}

export interface CotizacionesPanelResponse {
  titulos: CotizacionPanelItem[];
}

/**
 * Forma real (verificada a mano) de cada elemento dentro de `titulos` en la
 * respuesta de GET /api/v2/Cotizaciones/cauciones/todas/argentina.
 * `tasaPromedio` es el promedio ponderado de las operaciones del día para
 * ese plazo; no hay un campo de moneda propio (ver `esPesos` en
 * `lib/iol/caucion.ts`).
 */
export interface CaucionTitulo {
  plazo: number;
  montoContado: number;
  tasaPromedio: number;
  fechaVencimiento: string;
}

export interface CaucionesResponse {
  titulos: CaucionTitulo[];
}
