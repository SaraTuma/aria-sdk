import { Injectable, Inject } from "@angular/core";
import type {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { HttpErrorResponse } from "@angular/common/http";
import { Observable, BehaviorSubject, throwError, from } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";
import {
  getToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  redirectToLogin,
} from "@aria-iam/core";
import { ARIA_IAM_CONFIG, AriaIamConfig } from "./aria-iam.config";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(@Inject(ARIA_IAM_CONFIG) private config: AriaIamConfig) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = getToken(this.config.tokenNamespace);
    const authed = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authed).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401) return throwError(() => err);
        return this.handle401(req, next);
      })
    );
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.refreshing) {
      return this.refreshSubject.pipe(
        filter((t) => t !== null),
        take(1),
        switchMap((token) => next.handle(this.withToken(req, token!)))
      );
    }

    this.refreshing = true;
    this.refreshSubject.next(null);

    const refresh = getRefreshToken(this.config.tokenNamespace);
    const refreshCall = fetch(`${this.config.apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    }).then((r) => r.json());

    return from(refreshCall).pipe(
      switchMap((data: { accessToken: string; refreshToken: string }) => {
        setTokens(data.accessToken, data.refreshToken, this.config.tokenNamespace);
        this.refreshSubject.next(data.accessToken);
        this.refreshing = false;
        return next.handle(this.withToken(req, data.accessToken));
      }),
      catchError((err) => {
        this.refreshing = false;
        clearTokens(this.config.tokenNamespace);
        redirectToLogin(this.config.loginUrl, this.config.appId);
        return throwError(() => err);
      })
    );
  }

  private withToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
