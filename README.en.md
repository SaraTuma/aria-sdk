# ARIA SDK

> 🌐 Language: [Português](./README.md) · **English**

Authentication and access-control SDK for applications that integrate with the **ARIA IAM** platform.

## Packages

| Package | Description |
|---|---|
| [`@aria-iam/core`](./core) | Framework-agnostic TypeScript core — tokens, session, JWT, axios, SSO |
| [`@aria-iam/react`](./react) | React adapter — `AuthProvider`, `ProtectedRoute`, `PermissionProvider`, `FuncionalidadeGuard` |
| [`@aria-iam/angular`](./angular) | Angular adapter — `AuthService`, `authGuard`, `AuthInterceptor`, `CanPipe` |
| [`@aria-iam/vue`](./vue) | Vue 3 adapter — `AriaIamPlugin`, `useAuth`, `usePermissions`, `ProtectedRoute` |

---

## Requirements

- Node.js 18+
- TypeScript 5+ — the packages are distributed as `.ts` source, so your project needs a TypeScript-aware bundler (Vite, Angular CLI, webpack + ts-loader, etc.)
- A running instance of the ARIA backend, reachable from your app
- An application registered in the ARIA admin panel — this is what gives you the `appId` and the `loginUrl`

---

## Quick start — React

### 1. Install

```bash
npm install @aria-iam/core @aria-iam/react
```

### 2. Set up the providers

```tsx
// main.tsx
import { AuthProvider, ProtectedRoute, PermissionProvider } from "@aria-iam/react";
import { createAriaAxios } from "@aria-iam/core";

const api = createAriaAxios({
  apiUrl: "https://your-aria-backend.com",
  loginUrl: "https://your-aria-panel.com/login",
  namespace: "priv_2_my-app",
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider
      apiUrl="https://your-aria-backend.com"
      loginUrl="https://your-aria-panel.com/login"
      appId="your-app-id"          // string — stored in a cookie
      tokenNamespace="priv_2_my-app"
    >
      <PermissionProvider
        appId={2}                  // number — sent to your API
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

### 3. Protect pages by permission

```tsx
import { FuncionalidadeGuard } from "@aria-iam/react";
import { useNavigate } from "react-router-dom";

function ReportsPage() {
  const navigate = useNavigate();

  return (
    <FuncionalidadeGuard pkFuncionalidade={14} navigate={navigate}>
      <Reports />
    </FuncionalidadeGuard>
  );
}
```

### 4. Check permissions in components

```tsx
import { useCan, usePermissions } from "@aria-iam/react";

// convenience hook — returns boolean
const canEdit = useCan(14);

// full hook
const { can, loading, refresh } = usePermissions();
```

### 5. Read session data

```tsx
import { useAuth } from "@aria-iam/react";

function Header() {
  const { user, status } = useAuth();

  if (status === "checking") return <p>Loading...</p>;
  return <p>Welcome, {user.nome}</p>;
}
```

### 6. Create the HTTP client with automatic refresh

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

The client created by `createAriaAxios` automatically injects the token into every request and renews it on `401`, with no extra setup required.

> Using Angular or Vue instead? See the [`@aria-iam/angular`](./angular) and [`@aria-iam/vue`](./vue) package READMEs for their own quick starts — same underlying concepts, framework-specific APIs.

---

## Session namespacing (SSO / isolation)

When running multiple apps in the same browser, use `tokenNamespace` to isolate or share sessions.

```tsx
// Isolated session — each private app has its own tokens
<AuthProvider ... tokenNamespace="priv_2_tickets">
<AuthProvider ... tokenNamespace="priv_5_technova">

// Shared session — these two apps share the same SSO session
<AuthProvider ... tokenNamespace="part_unitel">  {/* financas */}
<AuthProvider ... tokenNamespace="part_unitel">  {/* rh      */}
```

---

## Full API reference

### `@aria-iam/core`

| Export | Description |
|---|---|
| `validateSession(apiUrl, namespace?)` | Validates the token with the backend → `{ status, user }` |
| `getToken(namespace?)` | Reads the access token from cookie |
| `getRefreshToken(namespace?)` | Reads the refresh token from cookie |
| `setTokens(access, refresh, namespace?)` | Persists tokens to cookie |
| `clearTokens(namespace?)` | Removes tokens from cookie |
| `getTokensFromUrl(namespace?)` | Reads tokens from URL params (SSO redirect) |
| `cleanUrlTokens(namespace?)` | Cleans tokens from URL after reading |
| `redirectToLogin(loginUrl, appId?)` | Sets the app cookie and redirects to login |
| `getPkContaFromToken(namespace?)` | Extracts `pkConta` from the JWT in cookie |
| `createAriaAxios({ apiUrl, loginUrl, namespace? })` | Creates an axios instance with auth and refresh interceptors |
| `buildNamespacedCookieKey(key, namespace?)` | Builds the namespaced cookie name |

### `@aria-iam/react`

| Export | Description |
|---|---|
| `<AuthProvider>` | Validates the session on load and provides the auth context |
| `<ProtectedRoute>` | Redirects to login if not authenticated |
| `<PermissionProvider>` | Loads and provides the user's permissions |
| `<FuncionalidadeGuard>` | Blocks rendering if no permission; redirects after `delayMs` |
| `useAuth()` | Access `{ status, user, appId, loginUrl, tokenNamespace }` |
| `usePermissions()` | Access `{ can, allowed, loading, refresh }` |
| `useCan(pkFuncionalidade)` | Returns `boolean` — shorthand for `can(pk)` |

See the [`@aria-iam/angular`](./angular) and [`@aria-iam/vue`](./vue) READMEs for the full reference of those adapters.

---

## How authentication works

```
App loads
   │
   ▼
AuthProvider reads token (cookie or URL param)
   │
   ├── no token → status: "unauthenticated" → redirect to login
   │
   └── token found → POST /auth/validate
          │
          ├── valid   → status: "authorized" → render app
          └── invalid → status: "unauthorized" → redirect to login

Inside the app:
   │
   ▼
PermissionProvider loads the user's permissions for this app
   │
   └── FuncionalidadeGuard checks if pkFuncionalidade ∈ allowed
          ├── yes → renders children
          └── no  → shows message and redirects after delayMs
```

---

## Contributing

1. Fork this repository
2. Create a branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push and open a Pull Request

---

## License

MIT
