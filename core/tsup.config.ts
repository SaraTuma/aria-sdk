import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["axios", "js-cookie", "jwt-decode"],
  clean: true,
  tsconfig: "tsconfig.build.json",
})
