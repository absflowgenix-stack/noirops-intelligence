import { rollup } from '/project/node_modules/rollup/dist/es/rollup.js';
import fs from 'node:fs';
import path from 'node:path';

const root = '/project';
const shard = Number(process.argv[2] || '0');
const shards = Number(process.argv[3] || '3');
const out = `/tmp/probe-${shard}.json`;

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) files.push(p);
  }
};
walk(path.join(root, 'src'));
files.sort();

const mine = files.filter((_, i) => i % shards === shard);
const state = { ok: 0, fail: 0, total: mine.length, failures: [] };
fs.writeFileSync(out, JSON.stringify(state));

for (const f of mine) {
  try {
    await rollup({
      input: f,
      external: () => true,
      treeshake: true,
      onwarn: () => {},
    });
    state.ok++;
  } catch (e) {
    state.fail++;
    state.failures.push({ file: f.replace(root + '/', ''), msg: String(e.message).slice(0, 300) });
  }
  fs.writeFileSync(out, JSON.stringify(state, null, 1));
}
console.log(`shard ${shard}: ok=${state.ok} fail=${state.fail}`);
