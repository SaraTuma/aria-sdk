# @aria-iam/angular

> 🌐 Language: **English** · [Português](./README.pt.md)

Angular adapter for the **ARIA IAM** platform. Provides a service, guards, an HTTP interceptor and a pipe that connect your Angular app to the ARIA authentication and permission system.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Prerequisites

Before using this package you need:

1. An **ARIA IAM backend** running and accessible (provided by your organisation).
2. An **application registered** in the ARIA admin panel — this gives you:
   - `appId` — the numeric ID of your app in ARIA (e.g. `2`).
   - `loginUrl` — the URL of the ARIA central login page.
3. **Permissions registered** in the ARIA panel for your app. Each permission has a `pkFuncionalidade` — a numeric ID (e.g. `14`) that you use in your code to show or hide UI elements.

> **Note on `appId`:** this value is used in two different shapes. In `AriaIamModule.forRoot()` / `ARIA_IAM_CONFIG` it's a **string** (it gets stored in a cookie that tells the ARIA login page which app you're coming from). In `PermissionService.load()` and inside your `fetchPermissions` callback, it's a **number** (it gets sent to your backend as `pkAplicacao`). Both refer to the same app ID — just keep the types straight when copying the examples below.

## Installation

```bash
npm install @aria-iam/core @aria-iam/angular
```

> Requires Angular 15–19, rxjs 7 and TypeScript ≥ 5.0.

## Quick start (NgModule)

```typescript
// app.module.ts
import { NgModule } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AriaIamModule, AuthInterceptor } from "@aria-iam/angular";

@NgModule({
  imports: [
    HttpClientModule,
    AriaIamModule.forRoot({
      apiUrl:         "https://your-aria-backend.com",
      loginUrl:       "https://your-aria-panel.com/login",
      appId:          "2",                  // app ID from the ARIA admin panel
      tokenNamespace: "priv_2_my-app",      // optional — cookie isolation key
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class AppModule {}
```

```typescript
// app-routing.module.ts
import { authGuard } from "@aria-iam/angular";

const routes: Routes = [
  { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
];
```

## Quick start (standalone, Angular 15+)

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ARIA_IAM_CONFIG, AuthInterceptor } from "@aria-iam/angular";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: ARIA_IAM_CONFIG,
      useValue: {
        apiUrl:         "https://your-aria-backend.com",
        loginUrl:       "https://your-aria-panel.com/login",
        appId:          "2",
        tokenNamespace: "priv_2_my-app",
      },
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
});
```

## API

### `AriaIamModule.forRoot(config)`

NgModule that registers `AuthInterceptor` and `CanPipe` globally.

```typescript
AriaIamModule.forRoot({
  apiUrl:         "https://your-aria-backend.com",       // required
  loginUrl:       "https://your-aria-panel.com/login",   // required
  appId:          "2",                                   // optional
  tokenNamespace: "priv_2_my-app",                       // optional
})
```

### `AuthService`

Reactive session state. Inject it into any component or service.

```typescript
import { AuthService } from "@aria-iam/angular";

@Component({ ... })
export class MyComponent {
  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.status$.subscribe(status => {
      // "checking" | "authorized" | "unauthorized" | "unauthenticated"
    });
  }

  logout() {
    this.auth.logout(); // clears tokens and redirects to loginUrl
  }
}
```

### `authGuard`

Functional route guard — redirects to login if the session is not authorized.

```typescript
{ path: "admin", component: AdminComponent, canActivate: [authGuard] }
```

### `AuthInterceptor`

Registered via the `providers` array (see Quick start above). Adds `Authorization: Bearer <token>` to every HTTP request and handles token refresh on 401 responses automatically.

### `PermissionService`

Loads and checks user permissions. Call `load()` in `ngOnInit`, not in the constructor.

```typescript
import { PermissionService } from "@aria-iam/angular";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Component({ ... })
export class DashboardComponent {
  constructor(
    private permissions: PermissionService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    const APP_ID = 2; // numeric app ID from the ARIA admin panel

    this.permissions.load(APP_ID, (pkConta, appId) =>
      firstValueFrom(
        this.http.get<{ data: number[] }>(
          "https://your-aria-backend.com/conta-funcionalidade/buscar-pksfuncionalidade-conta",
          { params: { pkConta, pkAplicacao: appId } }
        )
      ).then(r => r.data)
    );
  }

  // Use can() after load() has resolved
  get canEdit(): boolean {
    return this.permissions.can(14); // 14 = pkFuncionalidade from the ARIA admin panel
  }
}
```

### `funcionalidadeGuard(pkFuncionalidade)`

Route guard factory — blocks access to a route if the user lacks a specific permission. When the guard returns `false`, Angular cancels navigation and the user stays on the previous page.

```typescript
// app-routing.module.ts
import { funcionalidadeGuard } from "@aria-iam/angular";
import { Router } from "@angular/router";

const routes: Routes = [
  { path: "reports", canActivate: [funcionalidadeGuard(14)] },

  // Recommended: add a public "no access" page so users land somewhere useful
  // when they try to access a route they don't have permission for.
  { path: "sem-acesso", component: SemAcessoComponent },
  { path: "**", redirectTo: "sem-acesso" },
];
```

```typescript
// In your component, redirect manually if you want custom UX on guard failure:
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { funcionalidadeGuard } from "@aria-iam/angular";
import { tap } from "rxjs/operators";

// Wrapping funcionalidadeGuard to redirect on failure instead of staying put:
export function guardComRedirect(pkFunc: number): CanActivateFn {
  return (route, state) => {
    const router = inject(Router);
    const inner = funcionalidadeGuard(pkFunc);
    const result = inner(route, state) as ReturnType<CanActivateFn>;
    // If rxjs observable:
    if (typeof (result as any)?.subscribe === "function") {
      return (result as any).pipe(
        tap((ok: boolean) => { if (!ok) router.navigate(["/sem-acesso"]); })
      );
    }
    return result;
  };
}
```

### `CanPipe`

Template pipe for permission checks — hides the element if the user lacks the permission.

```html
<!-- 14 = pkFuncionalidade registered in the ARIA admin panel -->
<button *ngIf="14 | can">Edit</button>
```

## Session namespacing (SSO / isolation)

```typescript
// Isolated — each private app has its own tokens
AriaIamModule.forRoot({ ..., tokenNamespace: "priv_2_tickets" })
AriaIamModule.forRoot({ ..., tokenNamespace: "priv_5_technova" })

// Shared — these two apps share the same SSO session
AriaIamModule.forRoot({ ..., tokenNamespace: "part_unitel" })
```

## License

MIT © [Sara David Tuma](https://github.com/SaraTuma)
