<script setup lang="ts">
import { watch } from "vue";
import { redirectToLogin } from "@aria-iam/core";
import { useAuth } from "../composables/useAuth";
import { ariaState } from "../plugin";

const { status } = useAuth();

watch(
  status,
  (s) => {
    if (s !== "checking" && s !== "authorized") {
      redirectToLogin(ariaState.loginUrl, ariaState.appId);
    }
  },
  { immediate: true }
);
</script>

<template>
  <slot v-if="status === 'authorized'" />
</template>
