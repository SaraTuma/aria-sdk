# @aria-iam/core

> 🌐 Língua: [English](./README.md) · **Português**

Núcleo TypeScript independente de framework para a plataforma **ARIA IAM**. Gere tokens, validação de sessão, descodificação de JWT, namespace de cookies e configuração do cliente HTTP — sem dependência de React, Vue ou Angular.

Parte do [ARIA SDK](https://github.com/SaraTuma/aria-sdk).

## Pré-requisitos

Antes de usar este pacote precisas de:

1. Um **backend ARIA IAM** a correr e acessível (fornecido pela tua organização).
2. Uma **aplicação registada** no painel de administração ARIA — isso dá-te o `appId` (ID numérico) e o `loginUrl` (a página de login central do ARIA).

> Se usas React, Angular ou Vue, instala antes o adaptador correspondente — já inclui este pacote e acrescenta funções específicas do framework. Usa `@aria-iam/core` diretamente só se estiveres a trabalhar com um framework ainda não suportado ou precisares de controlo de baixo nível.

## Instalação

```bash
npm install @aria-iam/core
```

## Início rápido

```ts
import { createAriaAxios, validateSession, getPkContaFromToken } from "@aria-iam/core";

// 1. Criar o cliente HTTP configurado
const api = createAriaAxios({
  apiUrl:    "https://teu-backend-aria.com",
  loginUrl:  "https://teu-painel-aria.com/login",
  namespace: "priv_2_minha-app",   // opcional — isola cookies por app
});

// 2. Validar a sessão ao carregar a app
const { status, user } = await validateSession(
  "https://teu-backend-aria.com",
  "priv_2_minha-app"
);
// status: "authorized" | "unauthorized" | "unauthenticated" | "checking"

// 3. Ler o ID da conta a partir do JWT no cookie
const pkConta = getPkContaFromToken("priv_2_minha-app");
```

## Referência da API

### Sessão

| Função | Descrição |
|---|---|
| `validateSession(apiUrl, namespace?)` | `POST /auth/validate` — devolve `{ status, user }` |

### Cookies de token

| Função | Descrição |
|---|---|
| `getToken(namespace?)` | Lê o access token |
| `getRefreshToken(namespace?)` | Lê o refresh token |
| `setTokens(access, refresh, namespace?)` | Persiste os dois tokens |
| `clearTokens(namespace?)` | Remove os dois tokens |
| `getTokensFromUrl(namespace?)` | Lê tokens de parâmetros de URL (redirect SSO) |
| `cleanUrlTokens(namespace?)` | Remove os parâmetros de token da URL |

### JWT

| Função | Descrição |
|---|---|
| `getPkContaFromToken(namespace?)` | Descodifica o JWT e devolve `pkConta` |

### Navegação

| Função | Descrição |
|---|---|
| `redirectToLogin(loginUrl, appId?)` | Define o cookie da app e redireciona para o login |

### Cliente HTTP

| Função | Descrição |
|---|---|
| `createAriaAxios({ apiUrl, loginUrl, namespace? })` | Devolve uma instância axios com autenticação e refresh automático de token |

### Utilitários

| Função | Descrição |
|---|---|
| `buildNamespacedCookieKey(key, namespace?)` | Constrói o nome namespaced de um cookie, ex: `iam_accessToken__priv_2_tickets` |

## Como funciona o fluxo de sessão

1. O utilizador visita a tua app → `validateSession` procura um token nos cookies.
2. Sem token → `redirectToLogin` envia o utilizador para a página de login do ARIA.
3. Depois do login, o ARIA redireciona de volta para a tua app com os tokens na URL (`?iam_accessToken=...&iam_refreshToken=...`).
4. `getTokensFromUrl` lê-os, `setTokens` guarda-os como cookies, `cleanUrlTokens` remove-os da URL.
5. As chamadas seguintes através de `createAriaAxios` usam o token guardado automaticamente.

## Namespace de cookies

O namespace isola os cookies de sessão por app quando várias apps correm no mesmo browser.

```ts
// Apps privadas — sessões isoladas
getToken("priv_2_tickets")   // lê iam_accessToken__priv_2_tickets
getToken("priv_5_technova")  // lê iam_accessToken__priv_5_technova

// Apps partilhadas — mesma sessão SSO
getToken("part_unitel")      // as duas apps lêem o mesmo cookie
```

## Criar um adaptador para outro framework

```ts
import { validateSession, getPkContaFromToken, clearTokens, redirectToLogin } from "@aria-iam/core";

// Exemplo: composable Vue
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

## Licença

MIT © [Sara David Tuma](https://github.com/SaraTuma)
