import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPkContaFromToken } from "@aria-iam/core";
import { useAuth } from "./AuthProvider";

type PermissionContextValue = {
  allowed: Set<number>;
  loading: boolean;
  refresh: () => Promise<void>;
  can: (pkFuncionalidade: number) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({
  children,
  appId,
  fetchPermissions,
}: {
  children: React.ReactNode;
  appId: number;
  fetchPermissions: (pkConta: number, appId: number) => Promise<number[]>;
}) {
  const { tokenNamespace } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const pkConta = getPkContaFromToken(tokenNamespace);
      if (!pkConta || !appId) {
        setAllowed(new Set());
        return;
      }
      const ids = await fetchPermissions(pkConta, appId);
      setAllowed(new Set(ids));
    } catch {
      setAllowed(new Set());
    } finally {
      setLoading(false);
    }
  }, [appId, tokenNamespace, fetchPermissions]);

  useEffect(() => {
    load();
  }, [load]);

  const can = useCallback((pk: number) => allowed.has(pk), [allowed]);

  const value = useMemo(
    () => ({ can, allowed, loading, refresh: load }),
    [allowed, loading, load, can]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions deve ser usado dentro de PermissionProvider");
  return ctx;
}

export function useCan(pkFuncionalidade: number): boolean {
  const { can, loading } = usePermissions();
  if (loading) return false;
  return can(pkFuncionalidade);
}
