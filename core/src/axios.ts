import axios, { AxiosInstance } from "axios";
import { getToken, getRefreshToken, setTokens, clearTokens } from "./tokens";
import { redirectToLogin } from "./navigation";

export function createAriaAxios({
  apiUrl,
  loginUrl,
  namespace,
}: {
  apiUrl: string;
  loginUrl: string;
  namespace?: string;
}): AxiosInstance {
  const instance = axios.create({ baseURL: apiUrl });

  let isRefreshing = false;
  let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
    failedQueue = [];
  };

  instance.interceptors.request.use((config) => {
    const token = getToken(namespace);
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;

      if (original.url?.includes("/auth/refresh-token")) {
        clearTokens(namespace);
        redirectToLogin(loginUrl);
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !original._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            original.headers["Authorization"] = `Bearer ${token}`;
            return instance(original);
          });
        }

        const refreshToken = getRefreshToken(namespace);

        if (!refreshToken) {
          clearTokens(namespace);
          redirectToLogin(loginUrl);
          return Promise.reject(error);
        }

        original._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.get(`${apiUrl}/auth/refresh-token`, {
            params: { refreshToken },
            headers: { "Content-Type": "application/json" },
          });

          const { access_token, refresh_token } = data.data || {};
          if (!access_token || !refresh_token) {
            throw new Error("Refresh não devolveu tokens válidos");
          }

          setTokens(access_token, refresh_token, namespace);
          instance.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
          original.headers["Authorization"] = `Bearer ${access_token}`;
          processQueue(null, access_token);
          return instance(original);
        } catch (err) {
          processQueue(err, null);
          clearTokens(namespace);
          redirectToLogin(loginUrl);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
