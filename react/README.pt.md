# @aria-iam/react

> 🌐 Língua: [English](./README.md) · **Português**

Adaptador React para a plataforma **ARIA IAM**. Disponibiliza providers, guards e hooks prontos a usar que ligam a tua app React ao sistema de autenticação e permissões ARIA.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Pré-requisitos

Antes de usar este pacote precisas de:

1. Um **backend ARIA IAM** a correr e acessível (fornecido pela tua organização).
2. Uma **aplicação registada** no painel de administração ARIA — isso dá-te:
   - `appId` — o ID numérico da tua app no ARIA (ex.: `2`).
   - `loginUrl` — o URL da página de login central do ARIA.
3. **Permissões registadas** no painel ARIA para a tua app. Cada permissão tem um `pkFuncionalidade` — um ID numérico (ex.: `14`) que usas no teu código para mostrar ou esconder elementos da interface.

> **Nota sobre o `appId`:** este valor é usado em duas formas diferentes. No `<AuthProvider appId>` é uma **string** (fica guardado num cookie que diz à página de login do ARIA de que app estás a vir). No `<PermissionProvider appId>` e dentro da tua função `fetchPermissions`, é um **número** (é enviado ao teu backend como `pkAplicacao`). Os dois referem-se ao mesmo ID de app — só tens de manter os tipos corretos ao copiar os exemplos abaixo.

## Instalação

```bash
npm install @aria-iam/core @aria-iam/react
```

> Requer React 18 ou 19 e TypeScript ≥ 5.0.

## Início rápido

```tsx
// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, ProtectedRoute, PermissionProvider } from "@aria-iam/react";
import { createAriaAxios } from "@aria-iam/core";

const APP_ID = 2; // ID numérico do painel de administração ARIA
const API_URL = "https://teu-backend-aria.com";
const LOGIN_URL = "https://teu-painel-aria.com/login";
const NS = "priv_2_minha-app"; // chave de isolamento de cookies

const api = createAriaAxios({ apiUrl: API_URL, loginUrl: LOGIN_URL, namespace: NS });

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider
      apiUrl={API_URL}
      loginUrl={LOGIN_URL}
      appId={String(APP_ID)}  // AuthProvider espera uma string (guardada num cookie)
      tokenNamespace={NS}
    >
      <PermissionProvider
        appId={APP_ID}
        fetchPermissions={(pkConta, appId) =>
          api
            .get("/conta-funcionalidade/buscar-pksfuncionalidade-conta", {
              params: { pkConta, pkAplicacao: appId },
            })
            .then(r => r.data.data as number[])
        }
      >
        <ProtectedRoute>
          <App />
        </ProtectedRoute>
      </PermissionProvider>
    </AuthProvider>
  </BrowserRouter>
);
```

## Componentes

### `<AuthProvider>`

Valida a sessão ao carregar. Todos os outros componentes e hooks têm de estar dentro dele.

```tsx
<AuthProvider
  apiUrl="https://teu-backend-aria.com"            // obrigatório — URL do backend ARIA
  loginUrl="https://teu-painel-aria.com/login"     // obrigatório — URL da página de login ARIA
  appId="2"                                        // obrigatório — ID da app como string (guardado num cookie)
  tokenNamespace="priv_2_minha-app"               // opcional — chave de isolamento de cookies
>
```

### `<ProtectedRoute>`

Redireciona para o login se a sessão não for válida. Coloca-o a envolver a árvore da app.

```tsx
<ProtectedRoute>
  <App />
</ProtectedRoute>
```

### `<PermissionProvider>`

Carrega as permissões do utilizador para a app actual. Tem de estar dentro de `<AuthProvider>`.

```tsx
<PermissionProvider
  appId={2}
  fetchPermissions={(pkConta, appId) =>
    api
      .get("/conta-funcionalidade/buscar-pksfuncionalidade-conta", {
        params: { pkConta, pkAplicacao: appId },
      })
      .then(r => r.data.data as number[])
  }
>
```

`fetchPermissions` recebe o ID da conta extraído do JWT e o ID da app, e deve devolver `Promise<number[]>` — a lista de `pkFuncionalidade` permitidos.

### `<FuncionalidadeGuard>`

Bloqueia a renderização e redireciona se o utilizador não tiver uma permissão específica (`pkFuncionalidade`).

> Requer `react-router-dom` para a prop `navigate`. Sem ela, usa `window.location.href` como alternativa.

```tsx
import { FuncionalidadeGuard } from "@aria-iam/react";
import { useNavigate } from "react-router-dom";

function PaginaRelatorios() {
  const navigate = useNavigate();

  return (
    <FuncionalidadeGuard
      pkFuncionalidade={14}    // obrigatório — ID da permissão a verificar
      navigate={navigate}      // opcional — função navigate do router
      redirectTo="/dashboard"  // opcional — destino do redirect, padrão: "/dashboard"
      delayMs={3000}           // opcional — atraso do redirect em ms, padrão: 3000
      isVisible={false}        // opcional — ignora a verificação se true
    >
      <Relatorios />
    </FuncionalidadeGuard>
  );
}
```

Se `navigate` não for fornecido, usa `window.location.href` como fallback.

## Hooks

### `useAuth()`

Acede ao contexto de autenticação.

```tsx
import { useAuth } from "@aria-iam/react";

const { status, user, appId, loginUrl, tokenNamespace } = useAuth();
// status: "checking" | "authorized" | "unauthorized" | "unauthenticated"
```

### `usePermissions()`

Acede ao contexto completo de permissões.

```tsx
import { usePermissions } from "@aria-iam/react";

const { can, allowed, loading, refresh } = usePermissions();

can(14);   // boolean — verifica uma permissão
refresh(); // volta a buscar permissões do backend
```

### `useCan(pkFuncionalidade)`

Hook de atalho para verificar uma permissão específica.

```tsx
import { useCan } from "@aria-iam/react";

const podeEditar = useCan(14); // devolve false enquanto carrega
```

## Namespace de sessão (SSO / isolamento)

```tsx
// Isolado — cada app privada tem os seus próprios tokens
<AuthProvider ... tokenNamespace="priv_2_tickets">
<AuthProvider ... tokenNamespace="priv_5_technova">

// Partilhado — estas duas apps partilham a mesma sessão SSO
<AuthProvider ... tokenNamespace="part_unitel">  {/* financas */}
<AuthProvider ... tokenNamespace="part_unitel">  {/* rh      */}
```

## Licença

MIT © [Sara David Tuma](https://github.com/SaraTuma)
