import type { Plugin } from 'vite';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

export function imageAssets(): Plugin {
  const heroModule = '\0virtual:rastlina-hero';
  let firstHero: { mobileImage: string; optimizedImage: string } | undefined;
  return {
    name: 'rastlina-image-assets',
    resolveId(id) { if (id === 'virtual:rastlina-hero') return heroModule; },
    async load(id) {
      if (id !== heroModule) return;
      if (process.env.RASTLINA_PRERENDER === '1') {
        const snapshot = await readFile('dist/hero-snapshot.json', 'utf8');
        return `export default ${snapshot};`;
      }
      // A build-time public banner snapshot makes the first visible content
      // independent of the runtime catalogue request. Unknown/new images
      // still use their live API URLs.
      try {
        const response = await fetch('https://api.rastlina.com/api/store/home-data/', { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error('Homepage unavailable');
        const data = await response.json();
        const slides = [];
        for (const slide of (data.hero_slides || []).slice(0, 10)) {
          const url = new URL(slide.image);
          if (url.origin !== 'https://api.rastlina.com' || !url.pathname.startsWith('/media/hero_slides/')) continue;
          try {
            const image = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
            if (!image.ok) continue;
            const buffer = Buffer.from(await image.arrayBuffer());
            if (buffer.length > 20_000_000) continue;
            const basename = url.pathname.split('/').pop()!.replace(/\.[^.]+$/, '');
            for (const width of [768, 1600]) {
              const optimized = await sharp(buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
              this.emitFile({ type: 'asset', fileName: `optimized/hero-${basename}-${width}.webp`, source: optimized });
            }
            slides.push({ id: slide.id, image: slide.image, link_url: slide.link_url, optimizedImage: `/optimized/hero-${basename}-1600.webp`, mobileImage: `/optimized/hero-${basename}-768.webp` });
          } catch { this.warn('A banner keeps its live API fallback.'); }
        }
        firstHero = slides[0];
        this.emitFile({ type: 'asset', fileName: 'hero-snapshot.json', source: JSON.stringify(slides) });
        return `export default ${JSON.stringify(slides)};`;
      } catch {
        this.warn('Banner snapshot unavailable; runtime catalogue remains the fallback.');
        this.emitFile({ type: 'asset', fileName: 'hero-snapshot.json', source: '[]' });
        return 'export default [];';
      }
    },
    transformIndexHtml: {
      order: 'post',
      handler() {
        if (!firstHero) return;
        return [{ tag: 'link', injectTo: 'head', attrs: {
          rel: 'preload', as: 'image', href: firstHero.optimizedImage,
          imagesrcset: `${firstHero.mobileImage} 768w, ${firstHero.optimizedImage} 1600w`,
          imagesizes: '100vw', fetchpriority: 'high',
        } }];
      },
    },
    async generateBundle() {
      for (const family of ['inter', 'playfair-display']) {
        this.emitFile({
          type: 'asset', fileName: `optimized/font-${family}-LICENSE.txt`,
          source: await readFile(`node_modules/@fontsource-variable/${family}/LICENSE`),
        });
      }
      for (const [source, output, width] of [
        ['logo.png', 'logo-optimized.webp', 520],
        ['self-watering-banner.png', 'self-watering-banner-optimized.webp', 1400],
      ] as const) {
        const input = await readFile(`public/${source}`);
        const optimized = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        this.emitFile({ type: 'asset', fileName: output, source: optimized });
        console.log(`${source}: ${input.length} -> ${optimized.length} bytes`);
      }
      const socialImage = await sharp(await readFile('public/self-watering-banner.png'))
        .resize({ width: 1200, height: 630, fit: 'contain', background: '#F8F7F4' })
        .webp({ quality: 82 }).toBuffer();
      this.emitFile({ type: 'asset', fileName: 'og-image.webp', source: socialImage });
      // Compile current reel covers into static assets rather than making
      // visitors download multi-megabyte PNGs. Original URLs remain fallbacks.
      try {
        const response = await fetch('https://api.rastlina.com/api/store/watch-and-shop/', { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error('Watch catalogue unavailable');
        const data = await response.json();
        const items = (Array.isArray(data) ? data : data.results || []) as Array<{ thumbnail?: string }>;
        for (const item of items.slice(0, 20)) {
          if (!item.thumbnail) continue;
          const url = new URL(item.thumbnail);
          if (url.origin !== 'https://api.rastlina.com' || !url.pathname.startsWith('/media/watch_shop/')) continue;
          try {
            const image = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
            if (!image.ok) continue;
            const buffer = Buffer.from(await image.arrayBuffer());
            if (buffer.length > 20_000_000) continue;
            const optimized = await sharp(buffer).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
            const basename = url.pathname.split('/').pop()!.replace(/\.[^.]+$/, '');
            this.emitFile({ type: 'asset', fileName: `optimized/watch-${basename}.webp`, source: optimized });
            console.log(`Reel cover: ${buffer.length} -> ${optimized.length} bytes`);
          } catch { this.warn('One reel cover could not be optimized; original image remains available.'); }
        }
      } catch { this.warn('Reel cover catalogue unavailable; original images remain available.'); }
    },
  };
}
