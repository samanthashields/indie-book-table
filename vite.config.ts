// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Load ALL env vars into process.env for server-side code (server routes and
// server functions need non-VITE_ vars like LOVABLE_API_KEY). Client code still
// only receives VITE_-prefixed vars via the wrapper's env injection — these
// are never added to the client bundle.
Object.assign(
  process.env,
  loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), ""),
);

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: [
        // Pin React Email's entities dependency to the hoisted v4.5.0 copy —
        // nested v7 copies removed these deep paths and break SSR. Match exact
        // specifiers only, so parse5's "entities/decode" keeps resolving normally.
        {
          find: /^entities\/lib\/decode\.js$/,
          replacement: path.resolve(__dirname, "node_modules/entities/lib/decode.js"),
        },
        {
          find: /^entities\/lib\/encode\.js$/,
          replacement: path.resolve(__dirname, "node_modules/entities/lib/encode.js"),
        },
        { find: /^entities$/, replacement: path.resolve(__dirname, "node_modules/entities") },
      ],
    },
  },
});
