import Cookies from "js-cookie";
import { IAM_PK_APLICACAO } from "./constants";

export function redirectToLogin(loginUrl: string, appId?: string): void {
  if (appId) {
    Cookies.set(IAM_PK_APLICACAO, appId, { expires: 7, path: "/" });
  }
  window.location.href = loginUrl;
}
