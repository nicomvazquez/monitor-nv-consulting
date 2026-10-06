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
              regularMarketVolume?: number;
              /** Cierre de la sesión anterior a la más reciente (siempre un cierre real, nunca un precio en vivo). */
              chartPreviousClose?: number;
              /** Ventana (epoch en segundos) de la sesión regular más próxima a "ahora": sirve para saber si el mercado está operando en este momento. */
              currentTradingPeriod?: { regular: { start: number; end: number } };
              shortName?: string;
              longName?: string;
            };
          },
        ]
      | null;
    error: { code: string; description: string } | null;
  };
}
