// Generates src/lib/lucide-shim.js — a stand-in for the lucide-react barrel
// that re-exports ONLY the icons the app imports, straight from the package's
// per-icon ESM files. Cuts ~1500 modules from the production graph.
const fs = require("fs");

const barrel = fs.readFileSync(
  "/project/node_modules/lucide-react/dist/esm/lucide-react.js",
  "utf8"
);

// Map every barrel export to its source icon file.
const nameToFile = new Map();
const re = /export\s*\{[^}]*?\bas\s+([A-Za-z0-9_]+)\s*\}?\s*from\s*"\.\/(icons\/[^"]+\.js)"/g;
let m;
while ((m = re.exec(barrel))) {
  nameToFile.set(m[1], m[2]);
}
const re2 = /export\s*\{\s*default\s+as\s+([A-Za-z0-9_]+)\s*\}\s*from\s*"\.\/(icons\/[^"]+\.js)"/g;
while ((m = re2.exec(barrel))) {
  nameToFile.set(m[1], m[2]);
}

console.log("barrel exports mapped:", nameToFile.size);

// Names the app imports.
const used = fs
  .readFileSync("/tmp/lucide-names.txt", "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean);

const missing = used.filter((n) => !nameToFile.has(n));
if (missing.length) {
  console.log("MISSING_FROM_BARREL:", missing.join(", "));
}

const lines = used
  .filter((n) => nameToFile.has(n))
  .map((n) => `export { default as ${n} } from "lucide-react/dist/esm/icons/${nameToFile.get(n).replace(/^icons\//, "")}";`);

const shim = `/**
 * Generated shim for "lucide-react" (aliased in vite.config.ts).
 * The real barrel re-exports ~1600 icon modules, which bloats the
 * production module graph past the platform build deadline. This shim
 * re-exports exactly the icons NoirOps imports from the same per-icon
 * ESM files, so behavior is identical while the graph stays small.
 * Regenerate with: node /tmp/gen-lucide-shim.cjs after adding new icons.
 */

${lines.join("\n")}
`;

fs.writeFileSync("/project/src/lib/lucide-shim.js", shim);
console.log("shim written with", lines.length, "exports");
