export const DOLARAPI_BASE_URL = "https://dolarapi.com/v1";

/**
 * A diferencia de la API de IOL, dolarapi.com es un servicio público y
 * gratuito sin autenticación ni cuota mensual conocida, así que no hace
 * falta la lógica de horario de mercado que usa el resto de la app — un
 * intervalo fijo alcanza.
 */
export const REVALIDATE_SECONDS_DOLARES = 60;
