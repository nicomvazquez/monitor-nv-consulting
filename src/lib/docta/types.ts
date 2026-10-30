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
