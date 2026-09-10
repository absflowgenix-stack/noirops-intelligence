// Build probe: runs vite build with a custom logger that writes every
// progress line to stderr (unbuffered) with a timestamp, so we can see how
// far the build gets even when the runner kills it.
import { build } from "vite";

const t0 = Date.now();
const log = (msg) =>
  process.stderr.write(`[+${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}\n`);

const logger = {
  info: (msg, opts) => log("info: " + msg),
  warn: (msg, opts) => log("warn: " + msg),
  warnOnce: (msg, opts) => log("warnOnce: " + msg),
  error: (msg, opts) => log("error: " + msg),
  clearScreen: () => {},
  hasErrorLogged: () => false,
  hasWarned: () => false,
};

try {
  await build({
    configFile: "/project/vite.config.ts",
    logLevel: "info",
    customLogger: logger,
    // Never watch; single-shot build
    build: { watch: null },
  });
  log("BUILD DONE");
} catch (e) {
  log("FAILED: " + (e && e.message ? e.message : String(e)));
  process.exit(1);
}