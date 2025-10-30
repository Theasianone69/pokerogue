import { defineConfig, loadEnv, type Rollup, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { minifyJsonPlugin } from "./src/plugins/vite/vite-minify-json-plugin";

export const defaultConfig: UserConfig = {
  // --- START OF IFRAME & PLUGINS FIX ---
  // 1. IFRAME FIX: Add headers to allow embedding
  server: {
    headers: {
      "X-Frame-Options": "ALLOWALL",
      "Content-Security-Policy": "frame-ancestors '*'",
    },
  },
  // 2. DEPENDENCY FIX: Enable plugins to resolve "#app/polyfills"
  plugins: [tsconfigPaths(), minifyJsonPlugin(["images", "battle-anims"], true)],
  // --- END OF IFRAME & PLUGINS FIX ---

  clearScreen: false,
  appType: "mpa",
  build: {
    chunkSizeWarningLimit: 10000,
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      onwarn(warning: Rollup.RollupLog, defaultHandler: (warning: string | Rollup.RollupLog) => void) {
        // Suppress "Module level directives cause errors when bundled" warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
};

export default defineConfig(({ mode }) => {
  const envPort = Number(loadEnv(mode, process.cwd()).VITE_PORT);

  return {
    ...defaultConfig,
    base: "",
    esbuild: {
      pure: mode === "production" ? ["console.log"] : [],
      keepNames: true,
    },
    // This server block is correctly merging port from defaultConfig/env
    server: {
      port: !Number.isNaN(envPort) ? envPort : 8000,
      // The headers from defaultConfig will be used, but if you wanted to keep this
      // as clean as possible, you could also define the 'headers' block here instead.
    },
  };
});
