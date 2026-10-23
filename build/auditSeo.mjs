import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';

const live = process.argv.includes('--live');
const output = process.argv.find(argument => argument.startsWith('--output='))?.slice(9);
if (!output) throw new Error('Specify --output with an audit report path');
const origin = 'https://www.rastlina.com';
const products = await fetch('https://api.rastlina.com/api/store/products/').then(response => {
  if (!response.ok) throw new Error('Catalogue unavailable');
  return response.json();
});
const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', optimizeDeps: { noDiscovery: true } });
try {
  const { default: handler } = await server.ssrLoadModule('/api/page.ts');
  const { applyProductEditorial, reviewedProductSkus } = await server.ssrLoadModule('/src/data/productEditorial.ts');
  const checks = [];
  let next = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < products.length) {
      const product = products[next++];
      const path = `/product/${encodeURIComponent(product.slug)}`;
      let status, body;
      if (live) {
        const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(30000) });
        status = response.status; body = await response.text();
      } else {
        const response = { setHeader() {}, status(code) { status = code; return response; }, send(value) { body = value; } };
        await handler({ query: { kind: 'product', slug: product.slug } }, response);
      }
      const name = applyProductEditorial({ ...product, description: '', care_instructions_list: [], what_you_get_list: [], sunlight: '', watering: '' }).name;
      const title = body.match(/<title[^>]*>(.*?)<\/title>/s)?.[1];
      const canonical = body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
      const scripts = [...body.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
      const schemas = scripts.flatMap(match => { const data = JSON.parse(match[1]); return Array.isArray(data) ? data : [data]; });
      const schema = schemas.find(value => value['@type'] === 'Product');
      checks.push({
        slug: product.slug, sku: product.sku, name, status, title, canonical,
        hasVisibleHeading: body.includes('<h1>'), hasSchema: Boolean(schema),
        schemaName: schema?.name, price: schema?.offers?.price, availability: schema?.offers?.availability,
        editorial: reviewedProductSkus.includes(product.sku),
        pass: status === 200 && canonical === `${origin}${path}` && schema?.name === name && Boolean(schema?.offers) && body.includes('<h1>'),
      });
    }
  }));
  const result = { date: new Date().toISOString(), mode: live ? 'live' : 'local-handler', products: products.length, passed: checks.filter(check => check.pass).length, editorialCoverage: checks.filter(check => check.editorial).length, checks };
  await writeFile(output, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ mode: result.mode, products: result.products, passed: result.passed, editorialCoverage: result.editorialCoverage, failures: checks.filter(check => !check.pass) }, null, 2));
  if (result.passed !== result.products) process.exitCode = 1;
} finally { await server.close(); }
