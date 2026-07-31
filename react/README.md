# @aria-iam/react

> 🌐 Language: **English** · [Português](./README.pt.md)

React adapter for the **ARIA IAM** platform. Provides ready-to-use providers, guards and hooks that connect your React app to the ARIA authentication and permission system.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Prerequisites

Before using this package you need:

1. An **ARIA IAM backend** running and accessible (provided by your organisation).
2. An **application registered** in the ARIA admin panel — this gives you:
   - `appId` — the numeric ID of your app in ARIA (e.g. `2`).
   - `loginUrl` — the URL of the ARIA central login page.
3. **Permissions registered** in the ARIA panel for your app. Each permission has a `pkFuncionalidade` — a numeric ID (e.g. `14`) that you use in your code to show or hide UI elements.

> **Note on `appId`:** this value is used in two different shapes. On `<AuthProvider appId>` it's a **string** (it gets stored in a cookie that tells the ARIA login page which app you're coming from). On `<PermissionProvider appId>` and inside your `fetchPermissions` callback, it's a **number** (it gets sent to your backend as `pkAplicacao`). Both refer to the same app ID — just keep the types straight when copying the examples below.

## Installation

```bash
npm install @aria-iam/core @aria-iam/react
```

> Requires React 18 or 19 and TypeScript ≥ 5.0.

## Quick start

```tsx
// main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, ProtectedRoute, PermissionProvider } from "@aria-iam/react";
import { createAriaAxios } from "@aria-iam/core";

const APP_ID = 2; // numeric ID from the ARIA admin panel
const API_URL = "https://your-aria-backend.com";
const LOGIN_URL = "https://your-aria-panel.com/login";
const NS = "priv_2_my-app"; // cookie isolation key

const api = createAriaAxios({ apiUrl: API_URL, loginUrl: LOGIN_URL, namespace: NS });

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider
      apiUrl={API_URL}
      loginUrl={LOGIN_URL}
      appId={String(APP_ID)}  // AuthProvider expects a string (stored in a cookie)
      tokenNamespace={NS}
    >
      <PermissionProvider
        appId={APP_ID}
        fetchPermissions={(pkConta, appId) =>
          api
            .get(`/conta-funcionalidade/buscar-pksfuncionalidade-conta`, {
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

## Components

### `<AuthProvider>`

Validates the session on load. All other components and hooks must be nested inside it.

```tsx
<AuthProvider
  apiUrl="https://your-aria-backend.com"       // required — your ARIA backend URL
  loginUrl="https://your-aria-panel.com/login" // required — ARIA login page URL
  appId="2"                                    // required — app ID as a string (stored in a cookie)
  tokenNamespace="priv_2_my-app"               // optional — cookie isolation key
>
```

### `<ProtectedRoute>`

Redirects to the login page if the session is not valid. Wrap it around the app tree.

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
  fetchPermissions={(pkConta, appId) =>
    api
      .get("/conta-funcionalidade/buscar-pksfuncionalidade-conta", {
        params: { pkConta, pkAplicacao: appId },
      })
      .then(r => r.data.data as number[])
  }
>
```

`fetchPermissions` receives the account ID (from the JWT) and the app ID, and must return `Promise<number[]>` — the list of allowed `pkFuncionalidade` values for this user.

### `<FuncionalidadeGuard>`

Blocks rendering and redirects if the user lacks a specific permission (`pkFuncionalidade`).

> Requires `react-router-dom` for the `navigate` prop. Without it, falls back to `window.location.href`.

```tsx
import { FuncionalidadeGuard } from "@aria-iam/react";
import { useNavigate } from "react-router-dom";

function ReportsPage() {
  const navigate = useNavigate();

  return (
    <FuncionalidadeGuard
      pkFuncionalidade={14}    // required — numeric permission ID from ARIA
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

can(14);   // boolean — is pkFuncionalidade 14 allowed for this user?
refresh(); // re-fetch permissions from the backend
```

### `useCan(pkFuncionalidade)`

Shorthand hook for a single permission check.

```tsx
import { useCan } from "@aria-iam/react";

const canEdit = useCan(14); // returns false while permissions are loading
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
