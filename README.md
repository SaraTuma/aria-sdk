# ARIA SDK

> 🌐 Língua: **Português** · [English](./README.en.md)

SDK de autenticação e controlo de acessos para aplicações que integram com a plataforma **ARIA IAM**.

## Pacotes

| Pacote | Descrição |
|---|---|
| [`@aria-iam/core`](./core) | Núcleo TypeScript independente de framework — tokens, sessão, JWT, axios, SSO |
| [`@aria-iam/react`](./react) | Adaptador React — providers, guards e hooks prontos a usar |

> **Em breve:** `@aria-iam/vue` · `@aria-iam/angular`

---

## Requisitos

- Node.js 18+
- TypeScript 5+
- Uma instância do [backend ARIA](https://github.com/your-org/aria-backend) a correr

---

## Início rápido — React

### 1. Instalar

```bash
npm install @aria-iam/core @aria-iam/react
```

### 2. Configurar os providers

```tsx
// main.tsx
import { AuthProvider, ProtectedRoute, PermissionProvider } from "@aria-iam/react";
import { ContaService } from "@/services/ContaService";

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
          ContaService.buscarFuncionalidadesPorConta(pkConta, appId)
            .then(r => r.data)
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

### 3. Proteger páginas por permissão

```tsx
import { FuncionalidadeGuard } from "@aria-iam/react";
import { useNavigate } from "react-router-dom";

function PaginaRelatorios() {
  const navigate = useNavigate();

  return (
    <FuncionalidadeGuard pkFuncionalidade={14} navigate={navigate}>
      <Relatorios />
    </FuncionalidadeGuard>
  );
}
```

### 4. Verificar permissões em componentes

```tsx
import { useCan, usePermissions } from "@aria-iam/react";

// hook de conveniência — retorna boolean
const podeEditar = useCan(14);

// hook completo
const { can, loading, refresh } = usePermissions();
```

### 5. Ler dados da sessão

```tsx
import { useAuth } from "@aria-iam/react";

function Header() {
  const { user, status } = useAuth();

  if (status === "checking") return <p>A carregar...</p>;
  return <p>Bem-vindo, {user.nome}</p>;
}
```

### 6. Criar o cliente HTTP com refresh automático

```ts
// lib/axios.ts
import { createAriaAxios } from "@aria-iam/core";

const api = createAriaAxios({
  apiUrl: import.meta.env.VITE_API_URL,
  loginUrl: import.meta.env.VITE_LOGIN_URL,
  namespace: import.meta.env.VITE_TOKEN_NAMESPACE,
});

export default api;
```

O cliente criado por `createAriaAxios` injeta o token automaticamente em cada pedido e renova-o quando recebe um `401`, sem precisar de configuração adicional.

---

## Namespace de sessão (SSO / isolamento)

Quando várias apps correm no mesmo browser, usa `tokenNamespace` para isolar ou partilhar sessões.

```tsx
// Sessão isolada — cada app privada tem os seus próprios tokens
<AuthProvider ... tokenNamespace="priv_2_tickets">
<AuthProvider ... tokenNamespace="priv_5_technova">

// Sessão partilhada — estas duas apps partilham a mesma sessão SSO
<AuthProvider ... tokenNamespace="part_unitel">  {/* financas */}
<AuthProvider ... tokenNamespace="part_unitel">  {/* rh      */}
```

---

## API completa

### `@aria-iam/core`

| Exportação | Descrição |
|---|---|
| `validateSession(apiUrl, namespace?)` | Valida o token com o backend → `{ status, user }` |
| `getToken(namespace?)` | Lê o access token do cookie |
| `getRefreshToken(namespace?)` | Lê o refresh token do cookie |
| `setTokens(access, refresh, namespace?)` | Persiste os tokens no cookie |
| `clearTokens(namespace?)` | Remove os tokens do cookie |
| `getTokensFromUrl(namespace?)` | Lê tokens de parâmetros de URL (SSO redirect) |
| `cleanUrlTokens(namespace?)` | Limpa os tokens da URL após leitura |
| `redirectToLogin(loginUrl, appId?)` | Define o cookie da app e redireciona para o login |
| `getPkContaFromToken(namespace?)` | Extrai `pkConta` do JWT no cookie |
| `createAriaAxios({ apiUrl, loginUrl, namespace? })` | Cria instância axios com interceptores de auth e refresh |
| `buildNamespacedCookieKey(key, namespace?)` | Constrói o nome namespaced de um cookie |

### `@aria-iam/react`

| Exportação | Descrição |
|---|---|
| `<AuthProvider>` | Valida a sessão ao carregar e disponibiliza o contexto de auth |
| `<ProtectedRoute>` | Redireciona para o login se não autenticado |
| `<PermissionProvider>` | Carrega e disponibiliza as permissões do utilizador |
| `<FuncionalidadeGuard>` | Bloqueia renderização se sem permissão; redireciona após `delayMs` |
| `useAuth()` | Acede a `{ status, user, appId, loginUrl, tokenNamespace }` |
| `usePermissions()` | Acede a `{ can, allowed, loading, refresh }` |
| `useCan(pkFuncionalidade)` | Retorna `boolean` — atalho para `can(pk)` |

---

## Como funciona a autenticação

```
App carrega
   │
   ▼
AuthProvider lê o token (cookie ou parâmetro de URL)
   │
   ├── sem token → status: "unauthenticated" → redireciona para o login
   │
   └── token encontrado → POST /auth/validate
          │
          ├── válido   → status: "authorized" → renderiza a app
          └── inválido → status: "unauthorized" → redireciona para o login

Dentro da app:
   │
   ▼
PermissionProvider carrega as permissões do utilizador para esta app
   │
   └── FuncionalidadeGuard verifica se pkFuncionalidade ∈ allowed
          ├── sim → renderiza os filhos
          └── não → mostra mensagem e redireciona após delayMs
```

---

## Como contribuir

1. Faz fork deste repositório
2. Cria um branch: `git checkout -b feat/minha-funcionalidade`
3. Faz commit das alterações: `git commit -m "feat: adicionar minha funcionalidade"`
4. Faz push e abre um Pull Request

---

## Licença

MIT
