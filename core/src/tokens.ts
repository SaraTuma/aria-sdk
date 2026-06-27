import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, buildNamespacedCookieKey } from "./constants";

export function getToken(namespace?: string): string | undefined {
  const key = buildNamespacedCookieKey(ACCESS_TOKEN_KEY, namespace);
  return Cookies.get(key) || Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(namespace?: string): string | undefined {
  const key = buildNamespacedCookieKey(REFRESH_TOKEN_KEY, namespace);
  return Cookies.get(key) || Cookies.get(REFRESH_TOKEN_KEY);
}

export function setTokens(
  accessToken: string,
  refreshToken: string | undefined,
  namespace?: string
): void {
  const accessKey = buildNamespacedCookieKey(ACCESS_TOKEN_KEY, namespace);
  const refreshKey = buildNamespacedCookieKey(REFRESH_TOKEN_KEY, namespace);

  Cookies.set(accessKey, accessToken, { expires: 7, path: "/" });
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });

  if (refreshToken) {
    Cookies.set(refreshKey, refreshToken, { expires: 7, path: "/" });
    Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  }
}

export function clearTokens(namespace?: string): void {
  const accessKey = buildNamespacedCookieKey(ACCESS_TOKEN_KEY, namespace);
  const refreshKey = buildNamespacedCookieKey(REFRESH_TOKEN_KEY, namespace);

  Cookies.remove(accessKey, { path: "/" });
  Cookies.remove(refreshKey, { path: "/" });
  Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
}

export function getTokensFromUrl(namespace?: string): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const params = new URLSearchParams(window.location.search);
  const scopedAccessKey = buildNamespacedCookieKey(ACCESS_TOKEN_KEY, namespace);
  const scopedRefreshKey = buildNamespacedCookieKey(REFRESH_TOKEN_KEY, namespace);
  return {
    accessToken: params.get(ACCESS_TOKEN_KEY) || params.get(scopedAccessKey),
    refreshToken: params.get(REFRESH_TOKEN_KEY) || params.get(scopedRefreshKey),
  };
}

export function cleanUrlTokens(namespace?: string): void {
  const scopedAccessKey = buildNamespacedCookieKey(ACCESS_TOKEN_KEY, namespace);
  const scopedRefreshKey = buildNamespacedCookieKey(REFRESH_TOKEN_KEY, namespace);
  const url = new URL(window.location.href);
  url.searchParams.delete(ACCESS_TOKEN_KEY);
  url.searchParams.delete(REFRESH_TOKEN_KEY);
  url.searchParams.delete(scopedAccessKey);
  url.searchParams.delete(scopedRefreshKey);
  window.history.replaceState({}, "", url.pathname + url.search);
}
