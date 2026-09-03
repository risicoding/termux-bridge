import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },

    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    target: "es2022",
  },

  {
    entry: {
      types: "src/types.ts",
    },

    dts: true,
    outDir: "dist",
    clean: false,

    // Don't generate JS for this entry
    skipNodeModulesBundle: true,
  },
]);
