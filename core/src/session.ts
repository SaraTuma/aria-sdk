import {
  getToken,
  getRefreshToken,
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

export async function validateSession(
  apiUrl: string,
  namespace?: string
): Promise<SessionResult> {
  const { accessToken: tokenFromUrl, refreshToken: refreshFromUrl } =
    getTokensFromUrl(namespace);

  const token = tokenFromUrl || getToken(namespace);
  const refreshToken = refreshFromUrl || getRefreshToken(namespace);

  if (!token) {
    return { status: "unauthenticated", user: null };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, uri: window.location.origin }),
    });

    if (response.ok) {
      const user = await response.json();
      setTokens(token, refreshToken ?? undefined, namespace);
      cleanUrlTokens(namespace);
      return { status: "authorized", user };
    }

    clearTokens(namespace);
    return { status: "unauthorized", user: null };
  } catch {
    return { status: "unauthorized", user: null };
  }
}
