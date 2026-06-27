import React, { useEffect } from "react";
import { redirectToLogin } from "@aria-iam/core";
import { useAuth } from "./AuthProvider";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status, appId, loginUrl } = useAuth();

  useEffect(() => {
    if (status === "unauthorized" || status === "unauthenticated") {
      redirectToLogin(loginUrl, appId);
    }
  }, [status, appId, loginUrl]);

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
