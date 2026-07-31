# @aria-iam/vue

> 🌐 Língua: [English](./README.md) · **Português**

Adaptador Vue 3 para a plataforma **ARIA IAM**. Disponibiliza um plugin, composables, um componente e uma directiva que ligam a tua app Vue 3 ao sistema de autenticação e permissões ARIA.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Pré-requisitos

Antes de usar este pacote precisas de:

1. Um **backend ARIA IAM** a correr e acessível (fornecido pela tua organização).
2. Uma **aplicação registada** no painel de administração ARIA — isso dá-te:
   - `appId` — o ID numérico da tua app no ARIA (ex.: `2`).
   - `loginUrl` — o URL da página de login central do ARIA.
3. **Permissões registadas** no painel ARIA para a tua app. Cada permissão tem um `pkFuncionalidade` — um ID numérico (ex.: `14`) que usas no teu código para mostrar ou esconder elementos da interface.

> **Nota sobre o `appId`:** este valor é usado em duas formas diferentes. Na configuração do `AriaIamPlugin` é uma **string** (fica guardado num cookie que diz à página de login do ARIA de que app estás a vir). Em `usePermissions().load()` e dentro da tua função `fetchPermissions`, é um **número** (é enviado ao teu backend como `pkAplicacao`). Os dois referem-se ao mesmo ID de app — só tens de manter os tipos corretos ao copiar os exemplos abaixo.

## Instalação

```bash
npm install @aria-iam/core @aria-iam/vue
```

> Requer Vue 3 e TypeScript ≥ 5.0.

## Início rápido

```typescript
// main.ts
import { createApp } from "vue";
import { AriaIamPlugin, vCan } from "@aria-iam/vue";
import App from "./App.vue";

const APP_ID = 2; // ID numérico do painel de administração ARIA

createApp(App)
  .use(AriaIamPlugin, {
    apiUrl:         "https://teu-backend-aria.com",
    loginUrl:       "https://teu-painel-aria.com/login",
    appId:          String(APP_ID),         // appId como string
    tokenNamespace: "priv_2_minha-app",     // opcional — chave de isolamento de cookies
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

const APP_ID = 2; // mesmo valor usado em main.ts
const NS = "priv_2_minha-app";

const api = createAriaAxios({
  apiUrl:    "https://teu-backend-aria.com",
  loginUrl:  "https://teu-painel-aria.com/login",
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

Plugin Vue — chama `app.use(AriaIamPlugin, config)` uma vez em `main.ts`.

```typescript
app.use(AriaIamPlugin, {
  apiUrl:         "https://teu-backend-aria.com",        // obrigatório
  loginUrl:       "https://teu-painel-aria.com/login",   // obrigatório
  appId:          "2",                                   // opcional
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

Composable para carregar e verificar permissões do utilizador. Chama `load()` dentro de `onMounted`.

```typescript
import { onMounted } from "vue";
import { usePermissions } from "@aria-iam/vue";
import { createAriaAxios } from "@aria-iam/core";

const APP_ID = 2; // ID numérico do painel de administração ARIA
const api = createAriaAxios({
  apiUrl:    "https://teu-backend-aria.com",
  loginUrl:  "https://teu-painel-aria.com/login",
  namespace: "priv_2_minha-app",
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

can(14); // boolean — pkFuncionalidade 14 está permitida para este utilizador?
```

### `useCan(pkFuncionalidade)`

Composable de atalho para verificar uma permissão específica. Devolve `ComputedRef<boolean>` reactivo.

```typescript
import { useCan } from "@aria-iam/vue";

const podeEditar = useCan(14); // 14 = pkFuncionalidade do painel ARIA
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
