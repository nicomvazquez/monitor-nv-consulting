export { auth as proxy } from "@/auth";

/**
 * Solo estas rutas piden login (ver el callback `authorized` en `auth.ts`) —
 * la home y el resto del sitio quedan públicos. El reporte diario (PDF/PNG)
 * se protege aparte, en la propia ruta (`/api/reporte-cierre`), porque ahí
 * un redirect no tiene sentido (la descarga espera un archivo, no una página).
 */
export const config = {
  matcher: ["/noticias/:path*", "/bonos/:path*", "/calculadora/:path*", "/analisis-acciones/:path*", "/acciones-argentinas/:path*"],
};
