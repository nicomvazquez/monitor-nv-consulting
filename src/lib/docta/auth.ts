import { env } from "@/config/env";
import { DOCTA_EXPIRY_SAFETY_MARGIN_MS, DOCTA_SCOPES, DOCTA_TOKEN_URL } from "./config";
import type { DoctaTokenResponse } from "./types";

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

// Mismo criterio que `lib/iol/auth.ts`: cache en memoria del proceso +
// deduplicación de pedidos concurrentes, para no pisar el rate limit del
// plan Basic (10 req/min, 15/día) pidiendo un token por request.
let cachedToken: CachedToken | null = null;
let pendingTokenRequest: Promise<string> | null = null;

async function requestNewToken(): Promise<string> {
  const response = await fetch(DOCTA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: env.doctaClientId,
      client_secret: env.doctaClientSecret,
      scope: DOCTA_SCOPES.join(" "),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo autenticar contra Docta (${response.status} ${response.statusText}). Verificá DOCTA_CLIENT_ID/DOCTA_CLIENT_SECRET.`,
    );
  }

  const data = (await response.json()) as DoctaTokenResponse;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - DOCTA_EXPIRY_SAFETY_MARGIN_MS,
  };

  return cachedToken.accessToken;
}

export async function getDoctaAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  if (!pendingTokenRequest) {
    pendingTokenRequest = requestNewToken().finally(() => {
      pendingTokenRequest = null;
    });
  }

  return pendingTokenRequest;
}
