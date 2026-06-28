# @aria-iam/angular

> 🌐 Language: **English** · [Português](./README.pt.md)

Angular adapter for the **ARIA IAM** platform. Provides a service, guards, an HTTP interceptor and a pipe that connect your Angular app to the ARIA authentication and permission system.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Installation

```bash
npm install @aria-iam/core @aria-iam/angular
```

## Quick start

```typescript
// app.module.ts
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AriaIamModule } from "@aria-iam/angular";

@NgModule({
  imports: [
    HttpClientModule,
    AriaIamModule.forRoot({
      apiUrl:         "https://your-aria-backend.com",
      loginUrl:       "https://your-aria-panel.com/login",
      appId:          "your-app-id",
      tokenNamespace: "priv_2_my-app",
    }),
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

### Standalone (Angular 15+)

```typescript
// main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ARIA_IAM_CONFIG, AuthInterceptor } from "@aria-iam/angular";

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: ARIA_IAM_CONFIG, useValue: { apiUrl: "...", loginUrl: "...", appId: "..." } },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
});
```

## API

### `AriaIamModule.forRoot(config)`

NgModule that registers `AuthInterceptor` and `CanPipe` globally.

```typescript
AriaIamModule.forRoot({
  apiUrl:         "https://your-aria-backend.com",  // required
  loginUrl:       "https://your-aria-panel.com/login", // required
  appId:          "your-app-id",                    // optional
  tokenNamespace: "priv_2_my-app",                  // optional
})
```

### `AuthService`

Reactive session state.

```typescript
import { AuthService } from "@aria-iam/angular";

constructor(private auth: AuthService) {}

ngOnInit() {
  this.auth.status$.subscribe(status => {
    // "checking" | "authorized" | "unauthorized" | "unauthenticated"
  });
}

logout() {
  this.auth.logout(); // clears tokens and redirects to loginUrl
}
```

### `authGuard`

Functional route guard — redirects to login if session is not authorized.

```typescript
{ path: "admin", component: AdminComponent, canActivate: [authGuard] }
```

### `AuthInterceptor`

Registered automatically by `AriaIamModule.forRoot()`. Adds `Authorization: Bearer <token>` to every request and handles token refresh on 401.

### `PermissionService`

Loads and checks user permissions.

```typescript
import { PermissionService } from "@aria-iam/angular";

constructor(private permissions: PermissionService) {
  this.permissions.load(2, (pkConta, appId) =>
    this.myApi.getPermissions(pkConta, appId)
  );
}

canEdit = this.permissions.can(14); // boolean
```

### `funcionalidadeGuard(pkFuncionalidade)`

Route guard factory — blocks access if the user lacks a specific permission.

```typescript
{ path: "reports", canActivate: [funcionalidadeGuard(14)] }
```

### `CanPipe`

Template pipe for permission checks.

```html
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
