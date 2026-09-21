import { jwtDecode } from "jwt-decode";
import {
  getToken,
  getTokensFromUrl,
  setTokens,
  clearTokens,
  cleanUrlTokens,
} from "./tokens";
import { getPkContaFromToken } from "./jwt";

export type SessionStatus =
  | "checking"
  | "authorized"
  | "unauthorized"
  | "unauthenticated";

export interface SessionResult {
  status: SessionStatus;
  user: unknown;
}

/**
 * O /auth/validate só confirma permissão sobre o recurso (um boolean); os dados da
 * conta (nome, tipoConta, etc.) vêm daqui — a mesma API que já é usada para preencher
 * o token no login (AuthController.buscarContaPorId).
 */
async function buscarContaAutenticada(
  apiUrl: string,
  token: string,
  namespace?: string
): Promise<unknown> {
  const pkConta = getPkContaFromToken(namespace);
  if (!pkConta) return null;

  try {
    const res = await fetch(`${apiUrl}/auth/buscar-conta-pkConta/${pkConta}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function validateLocally(token: string, namespace?: string): SessionResult {
  try {
    const decoded = jwtDecode<{ exp?: number; [key: string]: unknown }>(token);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      clearTokens(namespace);
      return { status: "unauthenticated", user: null };
    }
    return { status: "authorized", user: decoded };
  } catch {
    clearTokens(namespace);
    return { status: "unauthorized", user: null };
  }
}

export async function validateSession(
  apiUrl: string,
  namespace?: string
): Promise<SessionResult> {
  const { accessToken: tokenFromUrl, refreshToken: refreshFromUrl } =
    getTokensFromUrl(namespace);

  if (tokenFromUrl) {
    setTokens(tokenFromUrl, refreshFromUrl ?? undefined, namespace);
    cleanUrlTokens(namespace);
  }

  const token = tokenFromUrl || getToken(namespace);

  if (!token) {
    return { status: "unauthenticated", user: null };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, urlBackendServidor: window.location.origin }),
    });

    if (response.ok) {
      const json = await response.json();
      const internalCode = json?.retorno?.codigo;

      // Backend may return HTTP 200 even for invalid tokens; check internal code
      if (internalCode != null && internalCode >= 400) {
        clearTokens(namespace);
        return { status: "unauthorized", user: null };
      }

      const user = await buscarContaAutenticada(apiUrl, token, namespace);
      return { status: "authorized", user };
    }

    // Explicit rejection — token is invalid on the server
    if (response.status === 401 || response.status === 403) {
      clearTokens(namespace);
      return { status: "unauthorized", user: null };
    }

    // 400 (field mismatch) or other server error — fall back to local validation
  } catch {
    // Network error or CORS — fall back to local JWT validation
  }

  return validateLocally(token, namespace);
}
