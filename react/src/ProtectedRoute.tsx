import React, { useEffect } from "react";
import { redirectToLogin } from "@aria-iam/core";
import { useAuth } from "./AuthProvider";

const LOGIN_URL = "http://localhost:3001/login";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status, appId } = useAuth();

  useEffect(() => {
    if (status === "unauthorized" || status === "unauthenticated") {
      redirectToLogin(LOGIN_URL, appId);
    }
  }, [status, appId]);

  if (status === "checking") {
    return (
      <div className="w-full h-screen flex items-center justify-center text-xl font-sans">
        Carregando...
      </div>
    );
  }

  if (status === "unauthorized" || status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
};
