export const DOCTA_BASE_URL = "https://api.doctacapital.com.ar";

// Sin barra final: verificado contra la API real que `/token/` devuelve 404
// (Not Found) y solo `/token` llega al chequeo de credenciales.
export const DOCTA_TOKEN_URL = `${DOCTA_BASE_URL}/api/v1/auth/token`;

/**
 * Scopes confirmados contra la documentación real de Docta (docs.docta.com.ar):
 * sin el scope correspondiente, la API devuelve 403. El ejemplo de la doc de
 * auth menciona también "cedears:read stocks:read", pero no hay ningún
 * endpoint de acciones/CEDEARs en el índice de la documentación — probablemente
 * un ejemplo genérico, no algo que exista hoy. No agregar esos scopes sin
 * confirmar primero con una cuenta real que el endpoint existe.
 */
export const DOCTA_SCOPES = ["bonds:read", "fci:read"] as const;

/** Margen de seguridad antes de que venza el token, igual criterio que IOL (`lib/iol/auth.ts`). */
export const DOCTA_EXPIRY_SAFETY_MARGIN_MS = 30_000;
