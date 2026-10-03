import { createServer } from 'vite';
import { readFile, writeFile } from 'node:fs/promises';

// Render only the public first screen. No product prices, stock, personal
// information or authenticated API responses are captured in static HTML.
process.env.RASTLINA_PRERENDER = '1';
const server = await createServer({
  mode: 'production',
  server: { middlewareMode: true, watch: null },
  appType: 'custom',
  ssr: { noExternal: ['react-helmet-async'] },
});
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.tsx');
  const { html, helmet } = render();
  if (!html.includes('Rastlina Banner') || !html.includes('Ready-to-Gift Indoor Plants')) {
    throw new Error('Public homepage prerender is incomplete; refusing to publish it.');
  }
  let template = await readFile('dist/index.html', 'utf8');
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('Expected a fresh client template; rebuild before prerendering.');
  }
  // Root index files take precedence over rewrites on static hosts. Preserve
  // the empty SPA shell separately for shop, product and account routes.
  await writeFile('dist/app.html', template);
  template = template.replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${html}</div>`);
  template = template.replace(/<title>[^<]*<\/title>/, helmet.title.toString());
  template = template.replace(/<meta name="robots"[^>]*>/, '');
  template = template.replace('</head>', `${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}</head>`);
  await writeFile('dist/index.html', template);
  console.log(`Prerendered public homepage: ${template.length} characters`);
} finally {
  await server.close();
}
