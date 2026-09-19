
const {rollup} = await import("rollup");
const fs = await import("node:fs");
const path = await import("node:path");
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, {withFileTypes:true})) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) files.push(p); } };
walk("src");
files.sort();
const G = 15;
const groups = [];
for (let i = 0; i < files.length; i += G) groups.push(files.slice(i, i + G));
const results = [];
for (let gi = 0; gi < groups.length; gi++) {
  try {
    await rollup({ input: groups[gi], external: () => true, treeshake: true, onwarn: () => {} });
    results.push();
  } catch (e) {
    results.push();
  }
}
fs.writeFileSync("/tmp/probe-groups.txt", results.join("\n"));
console.log("PROBE_DONE groups=" + groups.length + " files=" + files.length);
