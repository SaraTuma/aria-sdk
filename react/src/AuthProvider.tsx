import React, { createContext, useContext, useState, useEffect } from "react";
import { validateSession, SessionStatus } from "@aria-iam/core";

interface AuthContextType {
  status: SessionStatus;
  user: unknown;
  appId: string;
}

export const AuthContext = createContext<AuthContextType>({
  status: "checking",
  user: null,
  appId: "",
});

export const AuthProvider = ({
  children,
  apiUrl,
  appId,
  tokenNamespace,
}: {
  children: React.ReactNode;
  apiUrl: string;
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

  return (
    <AuthContext.Provider value={{ status, user, appId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
