import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vlyPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/project/src",
      // vlyPlugin() injects `import '@vly-ai/integrations';` into every page,
      // and that module imports the Vercel AI SDK (`ai`) and
      // `@ai-sdk/openai-compatible` at the top level. That dragged the whole
      // AI SDK + zod module graph into the client bundle and blew past the
      // production build deadline in this runtime. Nothing on the client
      // instantiates VlyAI (AI runs in Convex "use node" actions, server-side),
      // so these tiny stubs satisfy the named imports and let Rollup drop the
      // rest. The screenshot listener and error reporting are unaffected.
      "ai": "/project/src/lib/ai-client-stub.ts",
      "@ai-sdk/openai-compatible": "/project/src/lib/openai-compatible-client-stub.ts",
    },
    // Force a single copy of React across all packages (including vlyPlugin).
    // Without this, @vly-ai/integrations can resolve its own React copy, which
    // triggers "Invalid hook call" errors at runtime.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // esbuild minifier is the fastest option.
    minify: "esbuild",
    // The platform build analyzes the graph with an in-browser Rollup whose
    // treeshaker can crash on this graph; bundling without treeshake is safe
    // here (esbuild still minifies, dev is unaffected).
    rollupOptions: { treeshake: false },
    // Modern browsers only — skips legacy transpilation, faster builds.
    target: "esnext",
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Bind to all interfaces so WebContainer's server-ready event fires.
    host: true,
    port: 5173,
    // Freebuff requires HMR to stay disabled.
    hmr: false,
  },
});
