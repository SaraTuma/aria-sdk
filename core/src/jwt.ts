import { jwtDecode } from "jwt-decode";
import { getToken } from "./tokens";

interface JwtPayload {
  conta: { pkConta: number };
  exp: number;
}

export function getPkContaFromToken(namespace?: string): number | null {
  try {
    const token = getToken(namespace);
    if (!token) return null;
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded?.conta?.pkConta ?? null;
  } catch {
    return null;
  }
}

/** Data de expiração do token actual — só metadados do próprio JWT, não dados da conta. */
export function getTokenExpiry(namespace?: string): Date | null {
  try {
    const token = getToken(namespace);
    if (!token) return null;
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded?.exp ? new Date(decoded.exp * 1000) : null;
  } catch {
    return null;
  }
}
