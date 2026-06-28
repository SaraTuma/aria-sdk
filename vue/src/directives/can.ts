import type { Directive } from "vue";
import { useCan } from "../composables/usePermissions";
import { watchEffect } from "vue";

export const vCan: Directive<HTMLElement, number> = {
  mounted(el, binding) {
    const hasPermission = useCan(binding.value);
    watchEffect(() => {
      el.style.display = hasPermission.value ? "" : "none";
    });
  },
};
