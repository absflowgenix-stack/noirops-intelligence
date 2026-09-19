#!/usr/bin/env node
/**
 * Repairs node_modules/.bin links for the build toolchain.
 *
 * Why this exists: a deploy container's node_modules cache was left in a
 * partial state by an aborted install, so bare `tsc` / `vite` could resolve
 * to the wrong thing (the registry's fake `tsc` troll package). This hook
 * runs after every install (package.json "postinstall") and idempotently
 * rebuilds the .bin links from the packages that are actually present.
 *
 * Never throws — a failed repair must not break installs; it only warns.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const binDir = path.join(root, "node_modules", ".bin");

// Candidates are tried in order: the `tsc` alias package first (guaranteed
// by package.json's "tsc": "npm:typescript@..." pin), then typescript itself.
const targets = [
  { name: "tsc", candidates: ["tsc/bin/tsc", "typescript/bin/tsc"] },
  { name: "tsserver", candidates: ["tsc/bin/tsserver", "typescript/bin/tsserver"] },
  { name: "vite", candidates: ["vite/bin/vite.js"] },
];

try {
  fs.mkdirSync(binDir, { recursive: true });

  for (const target of targets) {
    const linkPath = path.join(binDir, target.name);

    // Valid if the link resolves to one of the expected real binaries.
    let valid = false;
    try {
      const resolved = fs.realpathSync(linkPath);
      valid = target.candidates.some((c) => resolved === path.join(root, "node_modules", c));
    } catch {
      valid = false;
    }
    if (valid) continue;

    for (const candidate of target.candidates) {
      const abs = path.join(root, "node_modules", candidate);
      if (!fs.existsSync(abs)) continue;
      try {
        fs.rmSync(linkPath, { force: true });
      } catch {
        /* stale link removal is best-effort */
      }
      try {
        fs.symlinkSync(path.join("..", candidate), linkPath);
        console.log(`[ensure-build-bins] repaired node_modules/.bin/${target.name} -> ${candidate}`);
      } catch (err) {
        console.warn(`[ensure-build-bins] could not link ${target.name}: ${err.message}`);
      }
      break;
    }
  }
} catch (err) {
  console.warn(`[ensure-build-bins] skipped: ${err.message}`);
}
