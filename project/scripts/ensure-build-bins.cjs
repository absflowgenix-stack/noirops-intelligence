#!/usr/bin/env node
/**
 * Repairs node_modules/.bin links for the build toolchain.
 *
 * Why this exists: a deploy container's node_modules/cache was left in a
 * state where bare `tsc` resolved to the registry troll package ("This is
 * not the tsc command you are looking for") — possibly via a stale .bin
 * link, or via a package named `tsc` that is NOT TypeScript occupying the
 * alias slot. Bun's incremental install can consider such a node_modules
 * "complete" and never repair it.
 *
 * This hook runs after every install (package.json "postinstall") and
 * idempotently repoints .bin links for tsc/tsserver/vite at REAL packages,
 * validating candidates by package name (a package named `tsc` whose
 * package.json name is not "typescript" is NEVER accepted).
 *
 * Never throws — a failed repair must not break installs; it only warns.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const binDir = path.join(root, "node_modules", ".bin");

function packageName(pkgDir) {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "node_modules", pkgDir, "package.json"), "utf8"),
    );
    return typeof pkg.name === "string" ? pkg.name : null;
  } catch {
    return null;
  }
}

// Candidates are tried in order. A candidate is only accepted when the
// package directory actually IS the expected package (name check), so a
// troll package that squats on the `tsc` name can never be linked.
const targets = [
  {
    name: "tsc",
    expected: "typescript",
    candidates: [
      { dir: "typescript", bin: "bin/tsc" },
      { dir: "tsc", bin: "bin/tsc" }, // our npm:typescript alias — only if it IS typescript
    ],
  },
  {
    name: "tsserver",
    expected: "typescript",
    candidates: [
      { dir: "typescript", bin: "bin/tsserver" },
      { dir: "tsc", bin: "bin/tsserver" },
    ],
  },
  {
    name: "vite",
    expected: "vite",
    candidates: [{ dir: "vite", bin: "bin/vite.js" }],
  },
];

try {
  fs.mkdirSync(binDir, { recursive: true });

  for (const target of targets) {
    const linkPath = path.join(binDir, target.name);

    // Find the first candidate that genuinely is the expected package.
    let accepted = null;
    for (const candidate of target.candidates) {
      if (packageName(candidate.dir) !== target.expected) continue;
      const abs = path.join(root, "node_modules", candidate.dir, candidate.bin);
      if (!fs.existsSync(abs)) continue;
      accepted = { ...candidate, abs };
      break;
    }
    if (!accepted) {
      console.warn(
        `[ensure-build-bins] no real ${target.expected} package found; leaving node_modules/.bin/${target.name} untouched`,
      );
      continue;
    }

    // Valid only if the link resolves exactly to the accepted real binary.
    let valid = false;
    try {
      valid = fs.realpathSync(linkPath) === fs.realpathSync(accepted.abs);
    } catch {
      valid = false;
    }
    if (valid) continue;

    try {
      fs.rmSync(linkPath, { force: true });
    } catch {
      /* stale link removal is best-effort */
    }
    try {
      fs.symlinkSync(path.join("..", accepted.dir, accepted.bin), linkPath);
      console.log(
        `[ensure-build-bins] repaired node_modules/.bin/${target.name} -> ${accepted.dir}/${accepted.bin}`,
      );
    } catch (err) {
      console.warn(`[ensure-build-bins] could not link ${target.name}: ${err.message}`);
    }
  }
} catch (err) {
  console.warn(`[ensure-build-bins] skipped: ${err.message}`);
}
