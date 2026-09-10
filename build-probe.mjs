// Build probe: logs every phase to stderr with timestamps so we can see how
// far the build gets even when the runner kills the process.
const t0 = Date.now();
const log = (msg) =>
  process.stderr.write(`[+${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}\n`);

log("probe start");

const { build } = await import("vite");
log("vite imported");

const logger = {
  info: (msg, opts) => log("info: " + msg),
  warn: (msg, opts) => log("warn: " + msg),
  warnOnce: (msg, opts) => log("warnOnce: " + msg),
  error: (msg, opts) => log("error: " + msg),
  clearScreen: () => {},
  hasErrorLogged: () => false,
  hasWarned: () => false,
};

log("calling build()");
try {
  await build({
    configFile: "/project/vite.config.ts",
    logLevel: "info",
    customLogger: logger,
    build: { watch: null },
  });
  log("BUILD DONE");
} catch (e) {
  log("FAILED: " + (e && e.message ? e.message : String(e)));
  process.exit(1);
}