import { reactive } from "vue";
import type { App } from "vue";
import { validateSession } from "@aria-iam/core";
import type { SessionStatus } from "@aria-iam/core";

export interface AriaIamConfig {
  apiUrl: string;
  loginUrl: string;
  appId?: string;
  tokenNamespace?: string;
}

export interface AriaIamState {
  status: SessionStatus;
  user: unknown;
  loginUrl: string;
  appId?: string;
  tokenNamespace?: string;
}

export const ariaState = reactive<AriaIamState>({
  status: "checking",
  user: null,
  loginUrl: "",
  appId: undefined,
  tokenNamespace: undefined,
});

export const AriaIamPlugin = {
  install(app: App, config: AriaIamConfig) {
    ariaState.loginUrl = config.loginUrl;
    ariaState.appId = config.appId;
    ariaState.tokenNamespace = config.tokenNamespace;

    validateSession(config.apiUrl, config.tokenNamespace).then(({ status, user }) => {
      ariaState.status = status;
      ariaState.user = user;
    });

    app.provide("ariaIamConfig", config);
  },
};
