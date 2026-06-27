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
