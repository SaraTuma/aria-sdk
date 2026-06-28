export { AriaIamPlugin } from "./plugin";
export type { AriaIamConfig, AriaIamState } from "./plugin";
export { useAuth } from "./composables/useAuth";
export { usePermissions, useCan } from "./composables/usePermissions";
export { vCan } from "./directives/can";
export { default as ProtectedRoute } from "./components/ProtectedRoute.vue";
