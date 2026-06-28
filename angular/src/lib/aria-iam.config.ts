import { InjectionToken } from "@angular/core";

export interface AriaIamConfig {
  apiUrl: string;
  loginUrl: string;
  appId?: string;
  tokenNamespace?: string;
}

export const ARIA_IAM_CONFIG = new InjectionToken<AriaIamConfig>("AriaIamConfig");
