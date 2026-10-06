export const ARGENTINADATOS_BASE_URL = "https://api.argentinadatos.com/v1";

/** El riesgo país se actualiza una vez por rueda; no hace falta pedirlo seguido. */
export const REVALIDATE_SECONDS_RIESGO_PAIS = 30 * 60;

/** El calendario de feriados de un año no cambia de un día para el otro. */
export const REVALIDATE_SECONDS_FERIADOS = 60 * 60 * 24;

/** El UVA se actualiza una vez por día (incluso con algún valor a futuro ya publicado). */
export const REVALIDATE_SECONDS_UVA = 60 * 60 * 6;
