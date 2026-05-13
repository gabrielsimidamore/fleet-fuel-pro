// Adapted for Vercel deployment using Nitro adapter
// Previously used @cloudflare/vite-plugin which only works with Cloudflare Workers
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Disable cloudflare plugin — not compatible with Vercel
  cloudflare: false,
  tanstackStart: {
    // Use src/start.ts as the server entry (Nitro wraps it)
    server: { entry: "start" },
  },
  vite: {
    plugins: [
      nitro({ preset: "vercel" }),
    ],
  },
});
