/** Forma real de cada elemento de `results` en GET /estadisticas/v4.0/monetarias. */
export interface BcraVariable {
  idVariable: number;
  descripcion: string;
  categoria: string;
  tipoSerie: string;
  periodicidad: string;
  unidadExpresion: string;
  /** "ME" = moneda extranjera (USD), "ML" = moneda local (ARS). */
  moneda: string;
  primerFechaInformada: string;
  ultFechaInformada: string;
  ultValorInformado: number;
}

export interface BcraMonetariasResponse {
  status: number;
  metadata: { resultset: { count: number; offset: number; limit: number } };
  results: BcraVariable[];
}
