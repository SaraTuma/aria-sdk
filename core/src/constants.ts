export const ACCESS_TOKEN_KEY = "iam_accessToken";
export const REFRESH_TOKEN_KEY = "iam_refreshToken";
export const IAM_PK_APLICACAO = "iam_global_pk_aplicacao";

export function buildNamespacedCookieKey(baseKey: string, namespace?: string): string {
  if (!namespace) return baseKey;
  const normalized = namespace.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  if (!normalized) return baseKey;
  return `${baseKey}__${normalized}`;
}
