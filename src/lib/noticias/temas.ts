/** Temas de las noticias, en orden de prioridad: el primero que matchea el titular es su tema. */
export const TEMAS = [
  { id: "bonos", nombre: "Bonos y riesgo país", patron: /bono|riesgo pa[ií]s|tesoro|letra|cer\b|deuda/i },
  { id: "cripto", nombre: "Cripto", patron: /cripto|bitcoin|ethereum|stablecoin|usdt|binance|blockchain|solana|\bxrp\b|\bbtc\b|\beth\b|\btoken/i },
  { id: "dolar", nombre: "Dólar y reservas", patron: /d[oó]lar|cambiari|reservas|brecha|devaluaci[oó]n/i },
  { id: "acciones", nombre: "Acciones", patron: /acci[oó]n|merval|bolsa|cedear|panel l[ií]der/i },
  { id: "macro", nombre: "Macro y tasas", patron: /inflaci[oó]n|bcra|tasa|fmi|caputo|econom|fiscal|d[eé]ficit|super[aá]vit/i },
  { id: "internacional", nombre: "Internacional", patron: /wall street|s&p|nasdaq|dow jones|\bfed\b|estados unidos|petr[oó]leo|oro\b|commodit/i },
] as const;

export type TemaId = (typeof TEMAS)[number]["id"] | "todos";

/** Tema de un titular, o null si no matchea ninguno (igual se muestra, solo queda fuera de los filtros por tema). */
export function temaDe(titulo: string): TemaId | null {
  return TEMAS.find((tema) => tema.patron.test(titulo))?.id ?? null;
}
