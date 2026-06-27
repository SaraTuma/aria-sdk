# @aria-iam/react

> 🌐 Language: **English** · [Português](./README.pt.md)

React adapter for the **ARIA IAM** platform. Provides ready-to-use providers, guards and hooks that connect your React app to the ARIA authentication and permission system.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Installation

```bash
npm install @aria-iam/core @aria-iam/react
```

## Quick start

```tsx
// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, ProtectedRoute, PermissionProvider } from "@aria-iam/react";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider
      apiUrl="https://your-aria-backend.com"
      loginUrl="https://your-aria-panel.com/login"
      appId="your-app-id"
      tokenNamespace="priv_2_my-app"
    >
      <PermissionProvider
        appId={2}
        fetchPermissions={(pkConta, appId) =>
          fetch(`/api/permissions?pkConta=${pkConta}&appId=${appId}`)
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

## Components

### `<AuthProvider>`

Validates the session on load. All other components and hooks must be nested inside it.

```tsx
<AuthProvider
  apiUrl="https://your-aria-backend.com"       // required — ARIA backend URL
  loginUrl="https://your-aria-panel.com/login" // required — ARIA login page URL
  appId="your-app-id"                          // required — app identifier in ARIA
  tokenNamespace="priv_2_my-app"              // optional — cookie isolation key
>
```

### `<ProtectedRoute>`

Redirects to the login page if the session is not valid. Place it around the app tree.

```tsx
<ProtectedRoute>
  <App />
</ProtectedRoute>
```

### `<PermissionProvider>`

Loads the user's permissions for the current app. Must be nested inside `<AuthProvider>`.

```tsx
<PermissionProvider
  appId={2}
  fetchPermissions={(pkConta, appId) => myApi.getPermissions(pkConta, appId)}
>
```

`fetchPermissions` receives the account ID decoded from the JWT and the app ID, and must return a `Promise<number[]>` — the list of allowed `pkFuncionalidade` values.

### `<FuncionalidadeGuard>`

Blocks rendering and redirects if the user lacks a specific permission.

```tsx
import { FuncionalidadeGuard } from "@aria-iam/react";
import { useNavigate } from "react-router-dom";

function ReportsPage() {
  const navigate = useNavigate();

  return (
    <FuncionalidadeGuard
      pkFuncionalidade={14}    // required — permission ID to check
      navigate={navigate}      // optional — router navigate function
      redirectTo="/dashboard"  // optional — default: "/dashboard"
      delayMs={3000}           // optional — redirect delay in ms, default: 3000
      isVisible={false}        // optional — bypass check if true
    >
      <Reports />
    </FuncionalidadeGuard>
  );
}
```

If `navigate` is not provided, falls back to `window.location.href`.

## Hooks

### `useAuth()`

Access the authentication context.

```tsx
import { useAuth } from "@aria-iam/react";

const { status, user, appId, loginUrl, tokenNamespace } = useAuth();
// status: "checking" | "authorized" | "unauthorized" | "unauthenticated"
```

### `usePermissions()`

Access the full permissions context.

```tsx
import { usePermissions } from "@aria-iam/react";

const { can, allowed, loading, refresh } = usePermissions();

can(14);   // boolean — check a single permission
refresh(); // re-fetch permissions from the backend
```

### `useCan(pkFuncionalidade)`

Shorthand hook for a single permission check.

```tsx
import { useCan } from "@aria-iam/react";

const canEdit = useCan(14); // returns false while loading
```

## Session namespacing (SSO / isolation)

```tsx
// Isolated — each private app has its own tokens
<AuthProvider ... tokenNamespace="priv_2_tickets">
<AuthProvider ... tokenNamespace="priv_5_technova">

// Shared — these two apps share the same SSO session
<AuthProvider ... tokenNamespace="part_unitel">  {/* financas */}
<AuthProvider ... tokenNamespace="part_unitel">  {/* rh      */}
```

## License

MIT © [Sara David Tuma](https://github.com/SaraTuma)
