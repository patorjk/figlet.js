/*
  Smoke test for the built bundles in dist/. The unit tests run against
  src/, so packaging breaks (e.g. import.meta.url being mis-transpiled
  in the CJS output, as in issue with figlet 1.11.1) only show up when
  the built files are actually loaded. Run after every build.
*/
import assert from 'assert';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist',
);

// CommonJS build: requiring it must not throw, and font path resolution
// must work so a default-font render succeeds.
const figletCjs = require(path.join(distDir, 'node-figlet.cjs'));
const cjsOutput = figletCjs.textSync('ok');
assert.ok(
  typeof cjsOutput === 'string' && cjsOutput.trim().length > 0,
  'node-figlet.cjs: textSync produced no output',
);

// ESM build. Some libraries `globalThis.__dirname`
globalThis.__dirname = path.join(distDir, 'bogus', 'polluted-dirname');
try {
  const figletEsm = (
    await import(pathToFileURL(path.join(distDir, 'node-figlet.mjs')).href)
  ).default;
  assert.strictEqual(
    figletEsm.defaults().fontPath,
    path.join(distDir, '../fonts/'),
    'node-figlet.mjs: fontPath was resolved from a polluted globalThis.__dirname instead of import.meta.url',
  );
  const esmOutput = figletEsm.textSync('ok');
  assert.ok(
    typeof esmOutput === 'string' && esmOutput.trim().length > 0,
    'node-figlet.mjs: textSync produced no output',
  );
} finally {
  delete globalThis.__dirname;
}

console.log('dist smoke test passed (node-figlet.cjs, node-figlet.mjs)');
