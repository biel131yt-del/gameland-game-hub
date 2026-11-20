import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    nitro(
      mode === "sites"
        ? {
            preset: "cloudflare-module",
            output: { publicDir: "dist/client", serverDir: "dist/server" },
            rollupConfig: { output: { entryFileNames: "index.js" } },
            cloudflare: { nodeCompat: true },
          }
        : {},
    ),
    react(),
  ],
}));
