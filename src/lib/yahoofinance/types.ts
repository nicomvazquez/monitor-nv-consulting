/** Forma real (verificada a mano) de GET /v8/finance/chart/{ticker}. Solo se tipa lo que se usa. */
export interface YahooChartResponse {
  chart: {
    result:
      | [
          {
            meta: {
              symbol: string;
              regularMarketPrice: number;
              regularMarketChangePercent?: number;
              shortName?: string;
              longName?: string;
            };
          },
        ]
      | null;
    error: { code: string; description: string } | null;
  };
}
