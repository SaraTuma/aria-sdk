import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { validateSession, clearTokens, redirectToLogin } from "@aria-iam/core";
import type { SessionStatus } from "@aria-iam/core";

interface AuthContextType {
  status: SessionStatus;
  user: unknown;
  appId: string;
  loginUrl: string;
  tokenNamespace?: string;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  status: "checking",
  user: null,
  appId: "",
  loginUrl: "",
  tokenNamespace: undefined,
  logout: () => {},
});

export const AuthProvider = ({
  children,
  apiUrl,
  loginUrl,
  appId,
  tokenNamespace,
}: {
  children: React.ReactNode;
  apiUrl: string;
  loginUrl: string;
  appId: string;
  tokenNamespace?: string;
}) => {
  const [status, setStatus] = useState<SessionStatus>("checking");
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    validateSession(apiUrl, tokenNamespace).then(({ status, user }) => {
      setUser(user);
      setStatus(status);
    });
  }, [apiUrl, tokenNamespace]);

  const logout = useCallback(() => {
    clearTokens(tokenNamespace);
    redirectToLogin(loginUrl, appId);
  }, [tokenNamespace, loginUrl, appId]);

  const value = useMemo(
    () => ({ status, user, appId, loginUrl, tokenNamespace, logout }),
    [status, user, appId, loginUrl, tokenNamespace, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);