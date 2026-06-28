# @aria-iam/angular

> 🌐 Língua: [English](./README.md) · **Português**

Adaptador Angular para a plataforma **ARIA IAM**. Disponibiliza um serviço, guards, um interceptor HTTP e um pipe que ligam a tua app Angular ao sistema de autenticação e permissões ARIA.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Instalação

```bash
npm install @aria-iam/core @aria-iam/angular
```

## Início rápido

```typescript
// app.module.ts
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { AriaIamModule } from "@aria-iam/angular";

@NgModule({
  imports: [
    HttpClientModule,
    AriaIamModule.forRoot({
      apiUrl:         "https://teu-backend-aria.com",
      loginUrl:       "https://teu-painel-aria.com/login",
      appId:          "id-da-tua-app",
      tokenNamespace: "priv_2_minha-app",
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

NgModule que regista o `AuthInterceptor` e o `CanPipe` globalmente.

```typescript
AriaIamModule.forRoot({
  apiUrl:         "https://teu-backend-aria.com",       // obrigatório
  loginUrl:       "https://teu-painel-aria.com/login",  // obrigatório
  appId:          "id-da-tua-app",                      // opcional
  tokenNamespace: "priv_2_minha-app",                   // opcional
})
```

### `AuthService`

Estado de sessão reactivo.

```typescript
import { AuthService } from "@aria-iam/angular";

constructor(private auth: AuthService) {}

ngOnInit() {
  this.auth.status$.subscribe(status => {
    // "checking" | "authorized" | "unauthorized" | "unauthenticated"
  });
}

logout() {
  this.auth.logout(); // limpa tokens e redireciona para loginUrl
}
```

### `authGuard`

Guard funcional de rota — redireciona para o login se a sessão não for válida.

```typescript
{ path: "admin", component: AdminComponent, canActivate: [authGuard] }
```

### `AuthInterceptor`

Registado automaticamente pelo `AriaIamModule.forRoot()`. Adiciona `Authorization: Bearer <token>` a todos os pedidos e trata do refresh do token em caso de 401.

### `PermissionService`

Carrega e verifica permissões do utilizador.

```typescript
import { PermissionService } from "@aria-iam/angular";

constructor(private permissions: PermissionService) {
  this.permissions.load(2, (pkConta, appId) =>
    this.minhaApi.buscarPermissoes(pkConta, appId)
  );
}

podeEditar = this.permissions.can(14); // boolean
```

### `funcionalidadeGuard(pkFuncionalidade)`

Fábrica de guards de rota — bloqueia o acesso se o utilizador não tiver uma permissão específica.

```typescript
{ path: "relatorios", canActivate: [funcionalidadeGuard(14)] }
```

### `CanPipe`

Pipe de template para verificação de permissões.

```html
<button *ngIf="14 | can">Editar</button>
```

## Namespace de sessão (SSO / isolamento)

```typescript
// Isolado — cada app privada tem os seus próprios tokens
AriaIamModule.forRoot({ ..., tokenNamespace: "priv_2_tickets" })
AriaIamModule.forRoot({ ..., tokenNamespace: "priv_5_technova" })

// Partilhado — estas duas apps partilham a mesma sessão SSO
AriaIamModule.forRoot({ ..., tokenNamespace: "part_unitel" })
```

## Licença

MIT © [Sara David Tuma](https://github.com/SaraTuma)
