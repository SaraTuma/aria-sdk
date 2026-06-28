import { ref, computed, readonly } from "vue";
import { getPkContaFromToken } from "@aria-iam/core";
import { ariaState } from "../plugin";

const allowed = ref<number[]>([]);
const loading = ref(false);
let loadPromise: Promise<void> | null = null;

export function usePermissions() {
  async function load(
    appId: number,
    fetchPermissions: (pkConta: number, appId: number) => Promise<number[]>
  ): Promise<void> {
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      const pkConta =
        getPkContaFromToken(ariaState.tokenNamespace) ??
        (ariaState.user as { conta?: { pkConta?: number } } | null)?.conta?.pkConta ??
        null;
      if (!pkConta) { loadPromise = null; return; }

      loading.value = true;
      try {
        allowed.value = await fetchPermissions(pkConta, appId);
      } finally {
        loading.value = false;
      }
    })();
    return loadPromise;
  }

  function can(pkFuncionalidade: number): boolean {
    return allowed.value.includes(pkFuncionalidade);
  }

  return {
    allowed: readonly(allowed),
    loading: readonly(loading),
    can,
    load,
    refresh: load,
  };
}

export function useCan(pkFuncionalidade: number) {
  return computed(() => allowed.value.includes(pkFuncionalidade));
}
