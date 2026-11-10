import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db/prisma";

/**
 * Login con Google únicamente (sin contraseñas que gestionar). La sesión
 * sigue viviendo en una cookie firmada (JWT) — no hay adapter de Auth.js acá
 * a propósito: se probó con `@auth/prisma-adapter` + `session.strategy:
 * "jwt"` esperando que el adapter igual guardara el usuario en cada login
 * (es el patrón "documentado" para no mover también la sesión a la base),
 * pero verificado a mano contra la base real, con `jwt` el adapter no llega
 * a tocar la base nunca — ni crea el usuario. Así que el guardado lo hace
 * directamente el callback `signIn` de acá abajo, sin depender del adapter
 * en absoluto. Necesita AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET y
 * DATABASE_URL/DATABASE_URL_UNPOOLED (ver .env.local).
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  // Sin esto, Auth.js arma la URL de redirect de OAuth contra "http://localhost:3000" en vez
  // de detectar el dominio real de la request — verificado a mano contra producción: Google
  // devolvía "redirect_uri_mismatch" con localhost:3000 en el redirect_uri, aunque se entrara
  // por el dominio real de Vercel.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Solo lo usa `proxy.ts` (ver matcher ahí) — decide si redirige a /login en las rutas que protege.
    authorized: ({ auth }) => Boolean(auth),
    // No bloquea el login si falla el guardado (`.catch` en vez de dejar que explote): quedarse
    // afuera de la cuenta por un problema de la base sería peor que simplemente no haber guardado el registro.
    async signIn({ user }) {
      if (!user.email) return true;
      await prisma.user
        .upsert({
          where: { email: user.email },
          create: { email: user.email, name: user.name ?? null, image: user.image ?? null },
          // `?? undefined` (no `?? null`): si Google no manda nombre/foto en este login puntual, Prisma
          // omite esos campos del UPDATE en vez de pisar un valor bueno que ya estaba guardado con null.
          update: { name: user.name ?? undefined, image: user.image ?? undefined, ultimoAcceso: new Date() },
        })
        .catch((cause) => {
          console.error("[auth] no se pudo guardar el usuario", cause);
        });
      return true;
    },
  },
});
