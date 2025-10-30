import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: false,
  external: ["react", "react-dom", "next", "next/router", "next/navigation"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
