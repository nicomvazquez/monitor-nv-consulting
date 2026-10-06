export const BCRA_BASE_URL = "https://api.bcra.gob.ar/estadisticas/v4.0";

/**
 * Estas series son diarias como mucho (inflación es mensual, la tasa de
 * política monetaria hace más de un año que no se actualiza), así que no
 * hace falta revalidar seguido — media hora ya es generoso.
 */
export const REVALIDATE_SECONDS_MACRO = 30 * 60;

/**
 * IDs de `idVariable` a mostrar, en este orden (pedido explícito del
 * usuario). Verificado a mano contra la API real:
 * 1   Reservas internacionales
 * 27  Inflación mensual
 * 28  Inflación interanual
 * 160 Tasa de interés de política monetaria
 * 139 Tasa BADLAR de bancos privados (benchmark de depósitos en pesos — a
 *     diferencia de la 160, sigue actualizándose día a día)
 * 15  Base monetaria
 * 155 LELIQ y NOTALQ
 */
export const MACRO_IDS = [1, 27, 28, 160, 139, 15] as const;
