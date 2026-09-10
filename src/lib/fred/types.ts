/** Forma real (verificada a mano) de GET /fred/series/observations. Solo se tipa lo que se usa. */
export interface FredObservationsResponse {
  observations: { date: string; value: string }[];
}
