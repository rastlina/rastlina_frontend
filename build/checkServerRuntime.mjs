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
  await emitModule(join(root, 'api/catalogue.ts'));
  await emitModule(join(root, 'api/collection.ts'));
  const runner = join(temporary, 'verify.mjs');
  await writeFile(runner, `import assert from 'node:assert/strict';
import handler from './api/page.js';
import catalogue from './api/catalogue.js';
import collection from './api/collection.js';
for (const [query, expected] of [[{kind:'article',slug:'1'},200],[{kind:'article',slug:'missing'},404],[{kind:'not-found'},404]]) {
  let status; let body; const headers = {};
  const response = {setHeader(key,value){headers[key]=value;},status(value){status=value;return this;},send(value){body=value;}};
  await handler({query},response);
  assert.equal(status,expected);
  assert.ok(body.includes('<h1>'));
  if(expected===404) assert.equal(headers['X-Robots-Tag'],'noindex, follow');
}
globalThis.fetch = async () => ({ok:true,json:async()=>[{id:1,price:'199.00',images:[{id:1,is_primary:true},{id:2,is_primary:false}]}]});
let catalogueBody; let catalogueStatus;
await catalogue({url:'/api/catalogue?ordering=price'}, {setHeader(){},status(value){catalogueStatus=value;return this;},send(value){catalogueBody=value;}});
assert.equal(catalogueStatus,200);
assert.equal(JSON.parse(catalogueBody)[0].images.length,1);
globalThis.fetch = async url => ({ok:true,json:async()=>String(url).includes('/categories/') ? [{name:'Exotic Plants',slug:'exotic-beauties',product_count:1}] : [{id:1,name:'Test Plant',slug:'test-plant',price:'199.00',images:[]}]});
let collectionBody; let collectionStatus;
await collection({url:'/shop?category=exotic-beauties'}, {setHeader(){},status(value){collectionStatus=value;return this;},send(value){collectionBody=value;}});
assert.equal(collectionStatus,200);
assert.ok(collectionBody.includes('<h1>Exotic Plants</h1>'));
assert.ok(collectionBody.includes('href="https://www.rastlina.com/shop?category=exotic-beauties"'));
console.log('Node server runtime: imports, catalogue, collections, articles and genuine 404s passed.');`);
  const check = spawnSync(process.execPath, [runner], { cwd: root, encoding: 'utf8' });
  if (check.stdout) process.stdout.write(check.stdout);
  if (check.stderr) process.stderr.write(check.stderr);
  assert.equal(check.status, 0, 'Node server runtime check failed');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
