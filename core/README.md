# @aria-iam/core

> 🌐 Language: **English** · [Português](./README.pt.md)

Framework-agnostic TypeScript core for the **ARIA IAM** platform. Handles token management, session validation, JWT decoding, cookie namespacing, and HTTP client setup — with no dependency on React, Vue, or Angular.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Installation

```bash
npm install @aria-iam/core
```

## Quick start

```ts
import { createAriaAxios, validateSession, getPkContaFromToken } from "@aria-iam/core";

// 1. Create a configured HTTP client
const api = createAriaAxios({
  apiUrl:    "https://your-aria-backend.com",
  loginUrl:  "https://your-aria-panel.com/login",
  namespace: "priv_2_my-app",   // optional — isolates cookies per app
});

// 2. Validate the session on app load
const { status, user } = await validateSession(
  "https://your-aria-backend.com",
  "priv_2_my-app"
);
// status: "authorized" | "unauthorized" | "unauthenticated" | "checking"

// 3. Read the account ID from the JWT in the cookie
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
| `getTokensFromUrl(namespace?)` | Read tokens from URL params (SSO redirect) |
| `cleanUrlTokens(namespace?)` | Remove token params from the URL |

### JWT

| Function | Description |
|---|---|
| `getPkContaFromToken(namespace?)` | Decode the JWT and return `pkConta` |

### Navigation

| Function | Description |
|---|---|
| `redirectToLogin(loginUrl, appId?)` | Set the app cookie and redirect to the login page |

### HTTP client

| Function | Description |
|---|---|
| `createAriaAxios({ apiUrl, loginUrl, namespace? })` | Returns an axios instance with auth and automatic token refresh |

### Utilities

| Function | Description |
|---|---|
| `buildNamespacedCookieKey(key, namespace?)` | Build a namespaced cookie name, e.g. `iam_accessToken__priv_2_tickets` |

## Cookie namespacing

Namespacing isolates session cookies per app when multiple apps run in the same browser.

```ts
// Private apps — isolated sessions
getToken("priv_2_tickets")   // reads iam_accessToken__priv_2_tickets
getToken("priv_5_technova")  // reads iam_accessToken__priv_5_technova

// Shared apps — same SSO session
getToken("part_unitel")      // both apps read the same cookie
```

## Building a framework adapter

```ts
import { validateSession, getPkContaFromToken, clearTokens, redirectToLogin } from "@aria-iam/core";

// Example: Vue composable
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
