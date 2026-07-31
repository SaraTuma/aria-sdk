# @aria-iam/vue

> 🌐 Language: **English** · [Português](./README.pt.md)

Vue 3 adapter for the **ARIA IAM** platform. Provides a plugin, composables, a component and a directive that connect your Vue 3 app to the ARIA authentication and permission system.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Prerequisites

Before using this package you need:

1. An **ARIA IAM backend** running and accessible (provided by your organisation).
2. An **application registered** in the ARIA admin panel — this gives you:
   - `appId` — the numeric ID of your app in ARIA (e.g. `2`).
   - `loginUrl` — the URL of the ARIA central login page.
3. **Permissions registered** in the ARIA panel for your app. Each permission has a `pkFuncionalidade` — a numeric ID (e.g. `14`) that you use in your code to show or hide UI elements.

> **Note on `appId`:** this value is used in two different shapes. In the `AriaIamPlugin` config it's a **string** (it gets stored in a cookie that tells the ARIA login page which app you're coming from). In `usePermissions().load()` and inside your `fetchPermissions` callback, it's a **number** (it gets sent to your backend as `pkAplicacao`). Both refer to the same app ID — just keep the types straight when copying the examples below.

## Installation

```bash
npm install @aria-iam/core @aria-iam/vue
```

> Requires Vue 3 and TypeScript ≥ 5.0.

## Quick start

```typescript
// main.ts
import { createApp } from "vue";
import { AriaIamPlugin, vCan } from "@aria-iam/vue";
import App from "./App.vue";

const APP_ID = 2; // numeric app ID from the ARIA admin panel

createApp(App)
  .use(AriaIamPlugin, {
    apiUrl:         "https://your-aria-backend.com",
    loginUrl:       "https://your-aria-panel.com/login",
    appId:          String(APP_ID),         // app ID as string
    tokenNamespace: "priv_2_my-app",        // optional — cookie isolation key
  })
  .directive("can", vCan)
  .mount("#app");
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { onMounted } from "vue";
import { ProtectedRoute, usePermissions } from "@aria-iam/vue";
import { createAriaAxios } from "@aria-iam/core";

const APP_ID = 2; // same value used in main.ts
const NS = "priv_2_my-app";

const api = createAriaAxios({
  apiUrl:    "https://your-aria-backend.com",
  loginUrl:  "https://your-aria-panel.com/login",
  namespace: NS,
});

const { load } = usePermissions();

onMounted(() =>
  load(APP_ID, (pkConta, appId) =>
    api
      .get("/conta-funcionalidade/buscar-pksfuncionalidade-conta", {
        params: { pkConta, pkAplicacao: appId },
      })
      .then(r => r.data.data as number[])
  )
);
</script>

<template>
  <ProtectedRoute>
    <RouterView />
  </ProtectedRoute>
</template>
```

## API

### `AriaIamPlugin`

Vue plugin — call `app.use(AriaIamPlugin, config)` once in `main.ts`.

```typescript
app.use(AriaIamPlugin, {
  apiUrl:         "https://your-aria-backend.com",       // required
  loginUrl:       "https://your-aria-panel.com/login",   // required
  appId:          "2",                                   // optional
  tokenNamespace: "priv_2_my-app",                       // optional
})
```

### `useAuth()`

Composable for reactive session state.

```typescript
import { useAuth } from "@aria-iam/vue";

const { status, user, logout } = useAuth();
// status: Ref<"checking" | "authorized" | "unauthorized" | "unauthenticated">
```

### `usePermissions()`

Composable for loading and checking user permissions. Call `load()` inside `onMounted`.

```typescript
import { onMounted } from "vue";
import { usePermissions } from "@aria-iam/vue";
import { createAriaAxios } from "@aria-iam/core";

const APP_ID = 2; // numeric app ID from the ARIA admin panel
const api = createAriaAxios({
  apiUrl:    "https://your-aria-backend.com",
  loginUrl:  "https://your-aria-panel.com/login",
  namespace: "priv_2_my-app",
});

const { allowed, loading, can, load } = usePermissions();

onMounted(() =>
  load(APP_ID, (pkConta, appId) =>
    api
      .get("/conta-funcionalidade/buscar-pksfuncionalidade-conta", {
        params: { pkConta, pkAplicacao: appId },
      })
      .then(r => r.data.data as number[])
  )
);

can(14); // boolean — is pkFuncionalidade 14 allowed for this user?
```

### `useCan(pkFuncionalidade)`

Shorthand composable for a single permission check. Returns a reactive `ComputedRef<boolean>`.

```typescript
import { useCan } from "@aria-iam/vue";

const canEdit = useCan(14); // 14 = pkFuncionalidade from the ARIA admin panel
```

```html
<button v-if="canEdit">Edit</button>
```

### `<ProtectedRoute>`

Component that redirects to the login page if the session is not authorized.

```html
<ProtectedRoute>
  <RouterView />
</ProtectedRoute>
```

### `v-can` directive

Element-level permission check — hides the element if the user lacks the permission.

```typescript
// main.ts — register the directive once
import { vCan } from "@aria-iam/vue";
app.directive("can", vCan);
```

```html
<!-- 14 = pkFuncionalidade registered in the ARIA admin panel -->
<button v-can="14">Edit</button>
```

## Session namespacing (SSO / isolation)

```typescript
// Isolated — each private app has its own tokens
app.use(AriaIamPlugin, { ..., tokenNamespace: "priv_2_tickets" })
app.use(AriaIamPlugin, { ..., tokenNamespace: "priv_5_technova" })

// Shared — these two apps share the same SSO session
app.use(AriaIamPlugin, { ..., tokenNamespace: "part_unitel" })
```

## License

MIT © [Sara David Tuma](https://github.com/SaraTuma)
