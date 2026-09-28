import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react", "react-dom", "@aria-iam/core"],
  banner: { js: '"use client";' },
  clean: true,
})
