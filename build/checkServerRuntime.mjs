import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

// Vite resolves extensionless imports, but Vercel's Node ESM runtime does not.
// Exercise the emitted function without Vite so a deployment cannot hide this error.
const root = process.cwd();
const temporary = await mkdtemp(join(tmpdir(), 'rastlina-server-check-'));
const visited = new Set();
async function emitModule(sourcePath) {
  if (visited.has(sourcePath)) return;
  visited.add(sourcePath);
  const source = await readFile(sourcePath, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false,
  } });
  const destination = join(temporary, relative(root, sourcePath).replace(/\.ts$/, '.js'));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, outputText);
  for (const match of outputText.matchAll(/\bfrom\s+['"](\.[^'"]+)['"]/g)) {
    assert.ok(match[1].endsWith('.js'), `Node ESM import requires .js: ${match[1]}`);
    const dependency = resolve(dirname(sourcePath), match[1].replace(/\.js$/, '.ts'));
    assert.ok(!relative(root, dependency).startsWith('..'), 'Server import must remain inside the project');
    await emitModule(dependency);
  }
}
try {
  await writeFile(join(temporary, 'package.json'), '{"type":"module"}');
  await emitModule(join(root, 'api/page.ts'));
  const runner = join(temporary, 'verify.mjs');
  await writeFile(runner, `import assert from 'node:assert/strict';
import handler from './api/page.js';
for (const [query, expected] of [[{kind:'article',slug:'1'},200],[{kind:'article',slug:'missing'},404],[{kind:'not-found'},404]]) {
  let status; let body; const headers = {};
  const response = {setHeader(key,value){headers[key]=value;},status(value){status=value;return this;},send(value){body=value;}};
  await handler({query},response);
  assert.equal(status,expected);
  assert.ok(body.includes('<h1>'));
  if(expected===404) assert.equal(headers['X-Robots-Tag'],'noindex, follow');
}
console.log('Node server runtime: imports, article rendering and genuine 404s passed.');`);
  const check = spawnSync(process.execPath, [runner], { cwd: root, encoding: 'utf8' });
  if (check.stdout) process.stdout.write(check.stdout);
  if (check.stderr) process.stderr.write(check.stderr);
  assert.equal(check.status, 0, 'Node server runtime check failed');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
