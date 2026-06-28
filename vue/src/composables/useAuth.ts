import { computed } from "vue";
import { clearTokens, redirectToLogin } from "@aria-iam/core";
import { ariaState } from "../plugin";

export function useAuth() {
  function logout() {
    clearTokens(ariaState.tokenNamespace);
    redirectToLogin(ariaState.loginUrl, ariaState.appId);
  }

  return {
    status: computed(() => ariaState.status),
    user: computed(() => ariaState.user),
    tokenNamespace: computed(() => ariaState.tokenNamespace),
    loginUrl: computed(() => ariaState.loginUrl),
    logout,
  };
}
