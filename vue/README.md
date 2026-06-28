# @aria-iam/vue

> 🌐 Language: **English** · [Português](./README.pt.md)

Vue 3 adapter for the **ARIA IAM** platform. Provides a plugin, composables, a component and a directive that connect your Vue 3 app to the ARIA authentication and permission system.

Part of the [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Installation

```bash
npm install @aria-iam/core @aria-iam/vue
```

## Quick start

```typescript
// main.ts
import { createApp } from "vue";
import { AriaIamPlugin } from "@aria-iam/vue";
import App from "./App.vue";

createApp(App)
  .use(AriaIamPlugin, {
    apiUrl:         "https://your-aria-backend.com",
    loginUrl:       "https://your-aria-panel.com/login",
    appId:          "your-app-id",
    tokenNamespace: "priv_2_my-app",
  })
  .mount("#app");
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ProtectedRoute } from "@aria-iam/vue";
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
  appId:          "your-app-id",                         // optional
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

Composable for loading and checking user permissions.

```typescript
import { usePermissions } from "@aria-iam/vue";

const { allowed, loading, can, load } = usePermissions();

// Load on mount
onMounted(() => load(2, (pkConta, appId) => myApi.getPermissions(pkConta, appId)));

can(14); // boolean
```

### `useCan(pkFuncionalidade)`

Shorthand composable for a single permission check. Returns a reactive `ComputedRef<boolean>`.

```typescript
import { useCan } from "@aria-iam/vue";

const canEdit = useCan(14);
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
// main.ts
import { vCan } from "@aria-iam/vue";
app.directive("can", vCan);
```

```html
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
