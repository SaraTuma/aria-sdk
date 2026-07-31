# @aria-iam/angular

> 🌐 Língua: [English](./README.md) · **Português**

Adaptador Angular para a plataforma **ARIA IAM**. Disponibiliza um serviço, guards, um interceptor HTTP e um pipe que ligam a tua app Angular ao sistema de autenticação e permissões ARIA.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Pré-requisitos

Antes de usar este pacote precisas de:

1. Um **backend ARIA IAM** a correr e acessível (fornecido pela tua organização).
2. Uma **aplicação registada** no painel de administração ARIA — isso dá-te:
   - `appId` — o ID numérico da tua app no ARIA (ex.: `2`).
   - `loginUrl` — o URL da página de login central do ARIA.
3. **Permissões registadas** no painel ARIA para a tua app. Cada permissão tem um `pkFuncionalidade` — um ID numérico (ex.: `14`) que usas no teu código para mostrar ou esconder elementos da interface.

> **Nota sobre o `appId`:** este valor é usado em duas formas diferentes. Em `AriaIamModule.forRoot()` / `ARIA_IAM_CONFIG` é uma **string** (fica guardado num cookie que diz à página de login do ARIA de que app estás a vir). Em `PermissionService.load()` e dentro da tua função `fetchPermissions`, é um **número** (é enviado ao teu backend como `pkAplicacao`). Os dois referem-se ao mesmo ID de app — só tens de manter os tipos corretos ao copiar os exemplos abaixo.

## Instalação

```bash
npm install @aria-iam/core @aria-iam/angular
```

> Requer Angular 15–19, rxjs 7 e TypeScript ≥ 5.0.

## Início rápido

```typescript
// app.module.ts
import { NgModule } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AriaIamModule, AuthInterceptor } from "@aria-iam/angular";

@NgModule({
  imports: [
    HttpClientModule,
    AriaIamModule.forRoot({
      apiUrl:         "https://teu-backend-aria.com",
      loginUrl:       "https://teu-painel-aria.com/login",
      appId:          "2",                  // ID da app no painel ARIA
      tokenNamespace: "priv_2_minha-app",   // opcional — chave de isolamento de cookies
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

## Início rápido (standalone, Angular 15+)

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
        apiUrl:         "https://teu-backend-aria.com",
        loginUrl:       "https://teu-painel-aria.com/login",
        appId:          "2",
        tokenNamespace: "priv_2_minha-app",
      },
    },
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
  appId:          "2",                                  // opcional
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

Carrega e verifica permissões do utilizador. Chama `load()` no `ngOnInit`, não no construtor.

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
    const APP_ID = 2; // ID numérico do painel de administração ARIA

    this.permissions.load(APP_ID, (pkConta, appId) =>
      firstValueFrom(
        this.http.get<{ data: number[] }>(
          "https://teu-backend-aria.com/conta-funcionalidade/buscar-pksfuncionalidade-conta",
          { params: { pkConta, pkAplicacao: appId } }
        )
      ).then(r => r.data)
    );
  }

  // Usar can() depois de load() ter resolvido
  get podeEditar(): boolean {
    return this.permissions.can(14); // 14 = pkFuncionalidade do painel ARIA
  }
}
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
