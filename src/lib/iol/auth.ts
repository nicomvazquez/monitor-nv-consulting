import { env } from "@/config/env";
import { IOL_TOKEN_URL } from "./config";
import type { IolTokenResponse } from "./types";

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

// Cache en memoria del proceso: evita pedir un token nuevo en cada request
// mientras la instancia serverless siga "tibia". No se comparte entre
// instancias, así que en el peor caso simplemente se pide un token de más.
let cachedToken: CachedToken | null = null;
let pendingTokenRequest: Promise<string> | null = null;

// Renovamos un poco antes de que expire (IOL da 15 minutos) para no arrancar
// un pedido de datos con un token a punto de vencer.
const EXPIRY_SAFETY_MARGIN_MS = 30_000;

async function requestNewToken(): Promise<string> {
  const body = new URLSearchParams({
    username: env.iolUsername,
    password: env.iolPassword,
    grant_type: "password",
  });

  const response = await fetch(IOL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `No se pudo autenticar contra IOL (${response.status} ${response.statusText}). Verificá IOL_USERNAME/IOL_PASSWORD.`,
    );
  }

  const data = (await response.json()) as IolTokenResponse;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - EXPIRY_SAFETY_MARGIN_MS,
  };

  return cachedToken.accessToken;
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  // Si ya hay un pedido de token en vuelo, todos esperan ese mismo en lugar
  // de disparar uno por request concurrente.
  if (!pendingTokenRequest) {
    pendingTokenRequest = requestNewToken().finally(() => {
      pendingTokenRequest = null;
    });
  }

  return pendingTokenRequest;
}
