/**
 * Hoja de Google Sheets del usuario con métricas de bonos (TIR, duration,
 * convexidad). Compartida como "cualquiera con el link puede ver" — no es
 * una credencial, por eso el ID va acá y no en variables de entorno (mismo
 * criterio que las URLs base de las demás APIs públicas del proyecto).
 */
export const BONOS_SHEET_ID = "1k_bDEWPKayXkWx6Rz4eJfCrNt9a65lTQ1naOQqzS-yI";

/** La exportación CSV sin `gid` trae la primera pestaña de la hoja. */
export const BONOS_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${BONOS_SHEET_ID}/export?format=csv`;

/** Es una hoja que el usuario edita a mano de tanto en tanto, no cotizaciones en vivo: alcanza con revisar cada 30 minutos. */
export const REVALIDATE_SECONDS_BONOS_SHEET = 30 * 60;
