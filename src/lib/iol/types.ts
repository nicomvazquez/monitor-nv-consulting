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
  /** `null` cuando el título no tiene puntas vigentes (pasa con CEDEARs poco líquidos del Panel General) — verificado contra la API real. */
  puntas: PuntaCotizacion | null;
}

export interface CotizacionesPanelResponse {
  titulos: CotizacionPanelItem[];
}

/**
 * Igual que `CotizacionPanelItem`, pero con `ultimoPrecio`/`variacionPorcentual`
 * ya resueltos según el modo (cierre o en vivo) — ver `aAccionCompleta` en
 * `cotizaciones.ts`. A diferencia de `FilaCotizacion` (la forma mínima que
 * usan las tablas del sitio), esta no descarta ningún campo: es la fila
 * "con todos los datos posibles" de `/acciones-argentinas`.
 */
export interface AccionCompleta {
  simbolo: string;
  descripcion: string;
  ultimoPrecio: number;
  variacionPorcentual: number | null;
  apertura: number;
  maximo: number;
  minimo: number;
  ultimoCierre: number;
  volumen: number;
  cantidadOperaciones: number;
  moneda: string;
  fecha: string;
  puntas: PuntaCotizacion | null;
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
