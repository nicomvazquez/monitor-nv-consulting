import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Login con Google únicamente (sin contraseñas que gestionar). Sin base de
 * datos: la sesión vive en una cookie firmada (JWT), no en un registro de
 * usuarios — cualquier cuenta de Google puede entrar, no hay una lista de
 * invitados. Necesita AUTH_SECRET, AUTH_GOOGLE_ID y AUTH_GOOGLE_SECRET
 * (ver .env.local).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Solo lo usa `proxy.ts` (ver matcher ahí) — decide si redirige a /login en las rutas que protege.
    authorized: ({ auth }) => Boolean(auth),
  },
});
