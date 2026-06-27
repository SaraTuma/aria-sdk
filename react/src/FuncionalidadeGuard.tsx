import React, { useEffect } from "react";
import { usePermissions } from "./PermissionProvider";

interface FuncionalidadeGuardProps {
  pkFuncionalidade: number;
  redirectTo?: string;
  delayMs?: number;
  children: React.ReactNode;
  isVisible?: boolean;
  navigate?: (to: string) => void;
}

export function FuncionalidadeGuard({
  pkFuncionalidade,
  redirectTo = "/dashboard",
  delayMs = 3000,
  children,
  isVisible = false,
  navigate,
}: FuncionalidadeGuardProps) {
  const { can, loading } = usePermissions();
  const isPermitido = can(pkFuncionalidade) || isVisible;

  useEffect(() => {
    if (!loading && !isPermitido) {
      const timer = setTimeout(() => {
        if (navigate) {
          navigate(redirectTo);
        } else {
          window.location.href = redirectTo;
        }
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [isPermitido, loading, navigate, redirectTo, delayMs]);

  if (loading) return null;

  if (!isPermitido) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-lg font-semibold text-red-500">
            Acesso não autorizado
          </h2>
          <p className="text-sm text-gray-500">
            Não tem permissão para aceder a esta funcionalidade.
          </p>
          <p className="text-xs text-gray-400">A redirecionar...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
