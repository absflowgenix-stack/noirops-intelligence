// Regenerates src/lib/lucide-shim.js — the stand-in for the lucide-react
// barrel (aliased in vite.config.ts with an exact-match pattern). Re-run
// after importing new icons:
//   node scripts/gen-lucide-shim.cjs
// Tooling only; not part of the app build graph.
const fs = require("fs");
const path = require("path");

const ROOT = "/project";
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "scripts",
  "tmp",
  ".git",
  ".turbo",
  "coverage",
]);

// 1. Scan every .ts/.tsx/.jsx file in the project (excluding skipped dirs)
//    for names imported from "lucide-react". importedAs -> sourceName
//    (handles `X` and `X as Y`).
const wanted = new Map();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (/\.(tsx?|jsx)$/.test(entry.name)) {
      const text = fs.readFileSync(path.join(dir, entry.name), "utf8");
      const re = /import\s*\{([^}]+)\}\s*from\s*["']lucide-react["']/g;
      let m;
      while ((m = re.exec(text))) {
        for (let part of m[1].split(",")) {
          part = part.trim();
          if (!part) continue;
          const bits = part.split(/\s+as\s+/);
          const sourceName = bits[0].trim();
          const importedAs = (bits[1] ? bits[1] : bits[0]).trim();
          if (sourceName) wanted.set(importedAs, sourceName);
        }
      }
    }
  }
}
walk(ROOT);

// 2. Map every barrel export to its per-icon ESM file. Statements look like:
//    export { default as X, default as XIcon, ... } from './icons/x.js';
const barrel = fs.readFileSync(
  path.join(ROOT, "node_modules/lucide-react/dist/esm/lucide-react.js"),
  "utf8"
);
const nameToFile = new Map();
const stmtRe = /export\s*\{([^}]+)\}\s*from\s*'\.\/(icons\/[^']+\.js)'/g;
let stmt;
while ((stmt = stmtRe.exec(barrel))) {
  const file = stmt[2];
  for (const rawName of stmt[1].split(",")) {
    const nameMatch = rawName.trim().match(/(?:default\s+as|\bas)\s+([A-Za-z0-9_]+)$/);
    if (nameMatch) nameToFile.set(nameMatch[1], file);
  }
}

// 3. Emit one re-export per imported name. Deep imports resolve through
//    node_modules normally because the alias only matches the bare specifier.
const missing = [];
const lines = [];
for (const importedAs of [...wanted.keys()].sort()) {
  const sourceName = wanted.get(importedAs);
  const file = nameToFile.get(sourceName);
  if (!file) {
    missing.push(`${sourceName} (as ${importedAs})`);
    continue;
  }
  lines.push(
    `export { default as ${importedAs} } from "lucide-react/dist/esm/icons/${file.replace(
      /^icons\//,
      ""
    )}";`
  );
}

const shim = `/**
 * Generated shim for "lucide-react" (aliased in vite.config.ts).
 * The real barrel re-exports ~1600 icon modules, which bloats the
 * production module graph past the platform build deadline. This shim
 * re-exports exactly the icons this app imports (scanned across the whole
 * project, including root-level files), from the same per-icon ESM files,
 * so behavior is identical while the graph stays small.
 * Regenerate after adding new icons:  node scripts/gen-lucide-shim.cjs
 */

${lines.join("\n")}
`;

fs.writeFileSync(path.join(ROOT, "src/lib/lucide-shim.js"), shim);
console.log("imports found:", wanted.size);
console.log("barrel exports mapped:", nameToFile.size);
console.log("shim exports written:", lines.length);
if (missing.length) console.log("MISSING:", missing.join(", "));
