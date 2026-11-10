-- Se deja de usar el adapter de Auth.js (ver src/auth.ts): con session.strategy "jwt"
-- nunca llegaba a escribir nada, así que estas tablas quedan sin uso.
DROP TABLE IF EXISTS "Session";
DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "VerificationToken";

-- El guardado ahora lo hace el callback `signIn` directamente, siempre con mail (Google lo garantiza).
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
