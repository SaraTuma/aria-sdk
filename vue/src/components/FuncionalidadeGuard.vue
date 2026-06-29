<script setup lang="ts">
import { computed, onUnmounted, watch } from "vue";
import { usePermissions } from "../composables/usePermissions";

const props = withDefaults(
  defineProps<{
    pkFuncionalidade: number;
    redirectTo?: string;
    delayMs?: number;
    isVisible?: boolean;
    /** Caminho actual da rota (ex: useRoute().path no Vue Router).
     *  Se omitido, usa window.location.pathname. */
    currentPath?: string;
  }>(),
  {
    redirectTo: "/dashboard",
    delayMs: 3000,
    isVisible: false,
  }
);

const { can, loading } = usePermissions();

const isPermitido = computed(() => can(props.pkFuncionalidade) || props.isVisible);

const pathname = computed(
  () => props.currentPath ?? (typeof window !== "undefined" ? window.location.pathname : "")
);
const jaNoDestino = computed(() => pathname.value === props.redirectTo);

let timer: ReturnType<typeof setTimeout> | null = null;

watch(
  [() => loading.value, isPermitido, jaNoDestino],
  ([isLoading, permitido, noDestino]) => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (!isLoading && !permitido && !noDestino) {
      timer = setTimeout(() => {
        window.location.href = props.redirectTo;
      }, props.delayMs);
    }
  },
  { immediate: true }
);

onUnmounted(() => { if (timer) clearTimeout(timer); });
</script>

<template>
  <template v-if="loading" />

  <template v-else-if="!isPermitido">
    <!-- Já está na página de destino — UI terminal sem redirect -->
    <div v-if="jaNoDestino" style="display:flex;height:60vh;align-items:center;justify-content:center;">
      <div style="max-width:28rem;text-align:center;">
        <h2 style="font-size:1.125rem;font-weight:600;color:#374151;margin-bottom:0.5rem;">
          Sem acesso a esta página
        </h2>
        <p style="font-size:0.875rem;color:#6B7280;">
          A sua conta não tem permissão para aceder a esta área. Utilize o menu de navegação.
        </p>
      </div>
    </div>

    <!-- Outra página — mostra mensagem e redireciona -->
    <div v-else style="display:flex;height:60vh;align-items:center;justify-content:center;">
      <div style="max-width:28rem;text-align:center;">
        <h2 style="font-size:1.125rem;font-weight:600;color:#EF4444;margin-bottom:0.5rem;">
          Acesso não autorizado
        </h2>
        <p style="font-size:0.875rem;color:#6B7280;margin-bottom:0.25rem;">
          Não tem permissão para aceder a esta funcionalidade.
        </p>
        <p style="font-size:0.75rem;color:#9CA3AF;">A redirecionar...</p>
      </div>
    </div>
  </template>

  <template v-else>
    <slot />
  </template>
</template>
