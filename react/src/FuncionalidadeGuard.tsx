import React, { useEffect } from "react";
import { usePermissions } from "./PermissionProvider";

interface FuncionalidadeGuardProps {
  pkFuncionalidade: number;
  redirectTo?: string;
  delayMs?: number;
  children: React.ReactNode;
  isVisible?: boolean;
  navigate?: (to: string) => void;
  /** Caminho actual da rota (ex: usePathname() no Next.js, useLocation().pathname no React Router).
   *  Se omitido, usa window.location.pathname. */
  currentPath?: string;
}

export function FuncionalidadeGuard({
  pkFuncionalidade,
  redirectTo = "/dashboard",
  delayMs = 3000,
  children,
  isVisible = false,
  navigate,
  currentPath,
}: FuncionalidadeGuardProps) {
  const { can, loading } = usePermissions();
  const isPermitido = can(pkFuncionalidade) || isVisible;

  const pathname = currentPath ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const jaNoDestino = pathname === redirectTo;

  useEffect(() => {
    if (!loading && !isPermitido && !jaNoDestino) {
      const timer = setTimeout(() => {
        if (navigate) {
          navigate(redirectTo);
        } else {
          window.location.href = redirectTo;
        }
      }, delayMs);
      return () => clearTimeout(timer);
    }
  }, [isPermitido, loading, jaNoDestino, navigate, redirectTo, delayMs]);

  if (loading) return null;

  if (!isPermitido) {
    if (jaNoDestino) {
      return (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="max-w-md text-center space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "#374151" }}>
              Sem acesso a esta página
            </h2>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              A sua conta não tem permissão para aceder a esta área. Utilize o menu de navegação.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-lg font-semibold text-red-500">
            Acesso não autorizado
          </h2>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Não tem permissão para aceder a esta funcionalidade.
          </p>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>A redirecionar...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
