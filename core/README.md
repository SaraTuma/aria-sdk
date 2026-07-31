# @aria-iam/core

> 🌐 Language: **English** · [Português](./README.pt.md)

Framework-agnostic TypeScript core for the **ARIA IAM** platform. Handles token management, session validation, JWT decoding, cookie namespacing, and HTTP client setup — with no dependency on React, Vue, or Angular.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Prerequisites

Before using this package you need:

1. An **ARIA IAM backend** running and accessible (provided by your organisation).
2. An **application registered** in the ARIA admin panel — this gives you the `appId` (numeric ID) and the `loginUrl` (the ARIA central login page).

> If you are using React, Angular or Vue, install the matching adapter instead — it already includes this package and adds framework-specific helpers. Use `@aria-iam/core` directly only if you are working with a framework not yet supported or need low-level control.

## Installation

```bash
npm install @aria-iam/core
```

## Quick start

```ts
import { createAriaAxios, validateSession, getPkContaFromToken } from "@aria-iam/core";

// 1. Create an HTTP client that attaches the token automatically
const api = createAriaAxios({
  apiUrl:    "https://your-aria-backend.com",
  loginUrl:  "https://your-aria-panel.com/login",
  namespace: "priv_2_my-app",   // optional — isolates cookies per app
});

// 2. Validate the session when the app loads
const { status, user } = await validateSession(
  "https://your-aria-backend.com",
  "priv_2_my-app"
);
// status: "authorized" | "unauthorized" | "unauthenticated" | "checking"

// 3. Read the account ID from the JWT stored in the cookie
const pkConta = getPkContaFromToken("priv_2_my-app");
```

## API reference

### Session

| Function | Description |
|---|---|
| `validateSession(apiUrl, namespace?)` | `POST /auth/validate` — returns `{ status, user }` |

### Token cookies

| Function | Description |
|---|---|
| `getToken(namespace?)` | Read the access token |
| `getRefreshToken(namespace?)` | Read the refresh token |
| `setTokens(access, refresh, namespace?)` | Persist both tokens |
| `clearTokens(namespace?)` | Remove both tokens |
| `getTokensFromUrl(namespace?)` | Read tokens from URL params (after login redirect) |
| `cleanUrlTokens(namespace?)` | Remove token params from the URL |

### JWT

| Function | Description |
|---|---|
| `getPkContaFromToken(namespace?)` | Decode the JWT and return the authenticated account's `pkConta` (numeric ID) |

### Navigation

| Function | Description |
|---|---|
| `redirectToLogin(loginUrl, appId?)` | Set the app cookie and redirect to the ARIA login page |

### HTTP client

| Function | Description |
|---|---|
| `createAriaAxios({ apiUrl, loginUrl, namespace? })` | Returns an axios instance that adds `Authorization: Bearer <token>` to every request and refreshes the token automatically on 401 |

### Utilities

| Function | Description |
|---|---|
| `buildNamespacedCookieKey(key, namespace?)` | Build a namespaced cookie name, e.g. `iam_accessToken__priv_2_tickets` |

## How the session flow works

1. The user visits your app → `validateSession` checks for a token in the cookies.
2. No token found → `redirectToLogin` sends the user to the ARIA login page.
3. After login, ARIA redirects back to your app with tokens in the URL (`?iam_accessToken=...&iam_refreshToken=...`).
4. `getTokensFromUrl` reads them, `setTokens` persists them as cookies, `cleanUrlTokens` removes them from the URL.
5. Subsequent calls to `createAriaAxios` use the stored token automatically.

## Cookie namespacing

The `namespace` (also called `tokenNamespace` in the framework adapters) controls which cookies are read and written. It lets you run multiple ARIA-integrated apps in the same browser without them sharing sessions.

```ts
// Private apps — each has its own isolated session
getToken("priv_2_tickets")   // reads iam_accessToken__priv_2_tickets
getToken("priv_5_technova")  // reads iam_accessToken__priv_5_technova

// Shared apps — same SSO session across the realm
getToken("part_unitel")      // both apps read the same cookie
```

Convention used in this project: `priv_<appId>_<name>` for private apps, `part_<realm>` for shared apps.

## Building a framework adapter

The core is designed so that any framework can be supported with a few lines:

```ts
import { validateSession, clearTokens, redirectToLogin } from "@aria-iam/core";

// Example: minimal Vue composable
export function useAriaAuth(apiUrl: string, loginUrl: string, namespace?: string) {
  const status = ref("checking");
  const user   = ref(null);

  onMounted(async () => {
    const result = await validateSession(apiUrl, namespace);
    status.value = result.status;
    user.value   = result.user;
    if (result.status !== "authorized") redirectToLogin(loginUrl);
  });

  return { status, user };
}
```

## License

MIT © [Sara David Tuma](https://github.com/SaraTuma)
