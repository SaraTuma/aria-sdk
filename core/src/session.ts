import { jwtDecode } from "jwt-decode";
import {
  getToken,
  getTokensFromUrl,
  setTokens,
  clearTokens,
  cleanUrlTokens,
} from "./tokens";

export type SessionStatus =
  | "checking"
  | "authorized"
  | "unauthorized"
  | "unauthenticated";

export interface SessionResult {
  status: SessionStatus;
  user: unknown;
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

      return { status: "authorized", user: json?.data ?? json };
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
