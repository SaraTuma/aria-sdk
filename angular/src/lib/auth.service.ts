import { Injectable, Inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  validateSession,
  redirectToLogin,
  clearTokens,
} from "@aria-iam/core";
import type { SessionStatus } from "@aria-iam/core";
import { ARIA_IAM_CONFIG, AriaIamConfig } from "./aria-iam.config";

@Injectable({ providedIn: "root" })
export class AuthService {
  private statusSubject = new BehaviorSubject<SessionStatus>("checking");
  private userSubject = new BehaviorSubject<unknown>(null);

  status$ = this.statusSubject.asObservable();
  user$   = this.userSubject.asObservable();

  get user(): unknown { return this.userSubject.value; }

  get status(): SessionStatus {
    return this.statusSubject.value;
  }

  constructor(@Inject(ARIA_IAM_CONFIG) private config: AriaIamConfig) {
    this.init();
  }

  private async init(): Promise<void> {
    const { status, user } = await validateSession(
      this.config.apiUrl,
      this.config.tokenNamespace
    );
    this.statusSubject.next(status);
    this.userSubject.next(user);
  }

  login(): void {
    redirectToLogin(this.config.loginUrl, this.config.appId);
  }

  logout(): void {
    clearTokens(this.config.tokenNamespace);
    redirectToLogin(this.config.loginUrl, this.config.appId);
  }
}
