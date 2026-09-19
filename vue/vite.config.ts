import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AriaIamVue",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["vue", "@aria-iam/core"],
      output: {
        globals: { vue: "Vue" },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
