import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vlyPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Stub the AI SDK out of the CLIENT bundle. vlyPlugin() injects
      // `import '@vly-ai/integrations';` into every page, and that module
      // imports `ai` / `@ai-sdk/openai-compatible` at top level — dragging
      // the whole AI SDK + zod module graph into every client build and
      // blowing past the build deadline in this browser runtime. The client
      // never instantiates VlyAI (only Convex "use node" actions do, on the
      // server), so these stubs are never called; the screenshot listener
      // and error reporting keep working.
      "ai": path.resolve(__dirname, "./src/lib/ai-client-stub.ts"),
      "@ai-sdk/openai-compatible": path.resolve(
        __dirname,
        "./src/lib/openai-compatible-client-stub.ts",
      ),
    },
    // Force a single copy of React across all packages (including vlyPlugin).
    // Without this, @vly-ai/integrations can resolve its own React copy, which
    // triggers "Invalid hook call" errors at runtime.
    dedupe: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
  build: {
    // esbuild minifier is the fastest option.
    minify: "esbuild",
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