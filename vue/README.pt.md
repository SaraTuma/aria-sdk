# @aria-iam/vue

> 🌐 Língua: [English](./README.md) · **Português**

Adaptador Vue 3 para a plataforma **ARIA IAM**. Disponibiliza um plugin, composables, um componente e uma directiva que ligam a tua app Vue 3 ao sistema de autenticação e permissões ARIA.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Instalação

```bash
npm install @aria-iam/core @aria-iam/vue
```

## Início rápido

```typescript
// main.ts
import { createApp } from "vue";
import { AriaIamPlugin } from "@aria-iam/vue";
import App from "./App.vue";

createApp(App)
  .use(AriaIamPlugin, {
    apiUrl:         "https://teu-backend-aria.com",
    loginUrl:       "https://teu-painel-aria.com/login",
    appId:          "id-da-tua-app",
    tokenNamespace: "priv_2_minha-app",
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

Plugin Vue — chama `app.use(AriaIamPlugin, config)` uma vez em `main.ts`.

```typescript
app.use(AriaIamPlugin, {
  apiUrl:         "https://teu-backend-aria.com",        // obrigatório
  loginUrl:       "https://teu-painel-aria.com/login",   // obrigatório
  appId:          "id-da-tua-app",                       // opcional
  tokenNamespace: "priv_2_minha-app",                    // opcional
})
```

### `useAuth()`

Composable para estado de sessão reactivo.

```typescript
import { useAuth } from "@aria-iam/vue";

const { status, user, logout } = useAuth();
// status: Ref<"checking" | "authorized" | "unauthorized" | "unauthenticated">
```

### `usePermissions()`

Composable para carregar e verificar permissões do utilizador.

```typescript
import { usePermissions } from "@aria-iam/vue";

const { allowed, loading, can, load } = usePermissions();

onMounted(() => load(2, (pkConta, appId) => minhaApi.buscarPermissoes(pkConta, appId)));

can(14); // boolean
```

### `useCan(pkFuncionalidade)`

Composable de atalho para verificar uma permissão específica. Devolve `ComputedRef<boolean>` reactivo.

```typescript
import { useCan } from "@aria-iam/vue";

const podeEditar = useCan(14);
```

```html
<button v-if="podeEditar">Editar</button>
```

### `<ProtectedRoute>`

Componente que redireciona para o login se a sessão não for válida.

```html
<ProtectedRoute>
  <RouterView />
</ProtectedRoute>
```

### Directiva `v-can`

Verificação de permissão ao nível do elemento — esconde o elemento se o utilizador não tiver a permissão.

```typescript
// main.ts
import { vCan } from "@aria-iam/vue";
app.directive("can", vCan);
```

```html
<button v-can="14">Editar</button>
```

## Namespace de sessão (SSO / isolamento)

```typescript
// Isolado — cada app privada tem os seus próprios tokens
app.use(AriaIamPlugin, { ..., tokenNamespace: "priv_2_tickets" })
app.use(AriaIamPlugin, { ..., tokenNamespace: "priv_5_technova" })

// Partilhado — estas duas apps partilham a mesma sessão SSO
app.use(AriaIamPlugin, { ..., tokenNamespace: "part_unitel" })
```

## Licença

MIT © [Sara David Tuma](https://github.com/SaraTuma)
