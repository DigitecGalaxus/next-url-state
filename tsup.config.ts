import { defineConfig } from "tsup";

const sharedConfig = {
  format: ["cjs", "esm"] as import("tsup").Format[],
  dts: true,
  splitting: false,
  sourcemap: true,
  treeshake: false,
};

export default defineConfig([
  {
    // Main client bundle — all hooks and providers
    // "use client" banner marks the entire bundle as client-only
    ...sharedConfig,
    entry: ["src/index.ts"],
    clean: true,
    external: ["react", "react-dom", "next", "next/router", "next/navigation"],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      };
    },
  },
  {
    // RSC bundle — createRscAdapter only, intentionally no "use client" banner
    // so it can be safely imported from React Server Components
    ...sharedConfig,
    entry: ["src/rsc.ts"],
    clean: false,
  },
]);
