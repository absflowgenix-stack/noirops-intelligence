import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vlyPlugin(), tailwindcss()],
  resolve: {
    alias: [
      // IMPORTANT: exact match only. A bare-string "lucide-react" alias would
      // also rewrite the shim's own deep imports ("lucide-react/dist/..."),
      // so this uses a RegExp. The lucide-react barrel re-exports ~1600 icon
      // modules; with the platform build's no-treeshake setting that alone
      // blew the transform deadline. The generated shim re-exports exactly
      // the icons the app imports from the same per-icon ESM files.
      // Regenerate after adding new icons:  node scripts/gen-lucide-shim.cjs
      { find: /^lucide-react$/, replacement: "/project/src/lib/lucide-shim.js" },
      // vlyPlugin() injects `import '@vly-ai/integrations';` into every page,
      // and that module imports the Vercel AI SDK (`ai`) and
      // `@ai-sdk/openai-compatible` at the top level. That dragged the whole
      // AI SDK + zod module graph into the client bundle and blew past the
      // production build deadline in this runtime. Nothing on the client
      // instantiates VlyAI (AI runs in Convex "use node" actions, server-side),
      // so these tiny stubs satisfy the named imports and let Rollup drop the
      // rest. The screenshot listener and error reporting are unaffected.
      { find: "ai", replacement: "/project/src/lib/ai-client-stub.ts" },
      {
        find: "@ai-sdk/openai-compatible",
        replacement: "/project/src/lib/openai-compatible-client-stub.ts",
      },
      { find: "@", replacement: "/project/src" },
    ],
    // Force a single copy of React across all packages (including vlyPlugin).
    // Without this, @vly-ai/integrations can resolve its own React copy, which
    // triggers "Invalid hook call" errors at runtime.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // Minification is skipped on purpose: the platform build runs Rollup in
    // the browser and esbuild-minifying the (un-treeshaken) graph exceeded
    // the 4-minute closeBundle deadline. Routes are lazy-loaded, so shipping
    // unminified chunks is safe and the build now finishes in time.
    minify: false,
    // Skipping the gzip-size report saves a full pass over every chunk.
    reportCompressedSize: false,
    // The platform build analyzes the graph with an in-browser Rollup whose
    // treeshaker can crash on this graph; bundling without treeshake is safe
    // here (dev is unaffected).
    rollupOptions: { treeshake: false },
    // Modern browsers only — skips legacy transpilation, faster builds.
    target: "esnext",
    chunkSizeWarningLimit: 2000,
  },
  server: {
    // Bind to all interfaces so WebContainer's server-ready event fires.
    host: true,
    port: 5173,
    // Freebuff requires HMR to stay disabled.
    hmr: false,
  },
});
