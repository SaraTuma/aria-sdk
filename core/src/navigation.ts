import Cookies from "js-cookie";
import { IAM_PK_APLICACAO } from "./constants";

export function redirectToLogin(loginUrl: string, appId?: string): void {
  if (appId) {
    Cookies.set(IAM_PK_APLICACAO, appId, { expires: 7, path: "/" });
  }
  window.location.href = resolveLoginDestination(loginUrl);
}

/**
 * Os cookies de sessão (iam_accessToken/iam_refreshToken) são httpOnly: só o servidor
 * da ARIA os consegue apagar, nunca o JS da app cliente. Por isso, antes de aterrar em
 * /login, passamos primeiro por /logout — a mesma origem já expõe essa rota e ela
 * própria reencaminha para /login depois de limpar a sessão real do lado do servidor.
 * Sem isto, uma sessão ainda válida faz o utilizador ser reautenticado de imediato.
 */
function resolveLoginDestination(loginUrl: string): string {
  try {
    const destino = new URL(loginUrl);
    if (/\/login\/?$/.test(destino.pathname)) {
      destino.pathname = destino.pathname.replace(/\/login\/?$/, "/logout");
      return destino.toString();
    }
    return loginUrl;
  } catch {
    return loginUrl;
  }
}
