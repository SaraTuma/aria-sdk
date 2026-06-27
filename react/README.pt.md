# @aria-iam/react

> 🌐 Língua: [English](./README.md) · **Português**

Adaptador React para a plataforma **ARIA IAM**. Disponibiliza providers, guards e hooks prontos a usar que ligam a tua app React ao sistema de autenticação e permissões ARIA.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Instalação

```bash
npm install @aria-iam/core @aria-iam/react
```

## Início rápido

```tsx
// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, ProtectedRoute, PermissionProvider } from "@aria-iam/react";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider
      apiUrl="https://teu-backend-aria.com"
      loginUrl="https://teu-painel-aria.com/login"
      appId="id-da-tua-app"
      tokenNamespace="priv_2_minha-app"
    >
      <PermissionProvider
        appId={2}
        fetchPermissions={(pkConta, appId) =>
          fetch(`/api/permissoes?pkConta=${pkConta}&appId=${appId}`)
            .then(r => r.json())
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
  appId="id-da-tua-app"                            // obrigatório — identificador da app no ARIA
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
  fetchPermissions={(pkConta, appId) => minhaApi.buscarPermissoes(pkConta, appId)}
>
```

`fetchPermissions` recebe o ID da conta extraído do JWT e o ID da app, e deve devolver `Promise<number[]>` — a lista de `pkFuncionalidade` permitidos.

### `<FuncionalidadeGuard>`

Bloqueia a renderização e redireciona se o utilizador não tiver uma permissão específica.

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
