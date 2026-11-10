export interface DoctaTokenResponse {
  access_token: string;
  expires_in: number;
  plan?: string;
}

/** Shape real confirmado contra `GET /api/v1/bonds/instruments` (y `/instruments/{symbol}`). */
export interface DoctaBondInstrument {
  ticker: string;
  name?: string;
  asset_class: string;
  sub_asset_class: string;
  sector?: string;
  issuer?: string;
  law?: string;
  isin?: string;
}

export interface DoctaBondInstrumentsResponse {
  data: DoctaBondInstrument[];
}

/**
 * Shape real (verificado a mano contra `GET /api/v1/bonds/analytics/{symbol}/cashflow`)
 * de cada pago futuro (y pasado — la respuesta trae el cronograma completo
 * del bono, no solo lo que falta) de un bono. `residual_value` es el valor
 * residual que QUEDA después de pagar `capital` ese día (no antes) — para el
 * valor residual vigente a una fecha dada hay que mirar el próximo pago
 * futuro y sumarle su propio `capital` (ver `lib/bonos/calculoTir.ts`).
 */
export interface DoctaCashflowEntry {
  issue_date: string;
  payment_date: string;
  capital: number;
  interest_rate: number;
  interest_amount: number;
  residual_value: number;
  cash_flow: number;
}

export interface DoctaCashflowResponse {
  ticker: string;
  data: DoctaCashflowEntry[];
  metadata: { subasset_class: string; nominal_units: number; total_records: number };
}
