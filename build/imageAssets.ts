import type { Plugin } from 'vite';
import sharp from 'sharp';
import { readFile, readdir } from 'node:fs/promises';

export function imageAssets(): Plugin {
  const heroModule = '\0virtual:rastlina-hero';
  const watchModule = '\0virtual:rastlina-watch-covers';
  let watchCovers: Record<string, string> = {};
  let firstHero: { mobileImage: string; optimizedImage: string; mobileAvif: string; optimizedAvif: string } | undefined;
  return {
    name: 'rastlina-image-assets',
    resolveId(id) {
      if (id === 'virtual:rastlina-hero') return heroModule;
      if (id === 'virtual:rastlina-watch-covers') return watchModule;
    },
    async load(id) {
      if (id === watchModule) {
        if (process.env.RASTLINA_PRERENDER === '1') {
          return `export default ${await readFile('dist/watch-covers.json', 'utf8')};`;
        }
        try {
          const response = await fetch('https://api.rastlina.com/api/store/watch-and-shop/', { signal: AbortSignal.timeout(20000) });
          if (!response.ok) throw new Error('Watch catalogue unavailable');
          const data = await response.json();
          const items = Array.isArray(data) ? data : data.watch_and_shop || data.results || [];
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
              const fileName = `optimized/watch-${basename}.webp`;
              this.emitFile({ type: 'asset', fileName, source: optimized });
              watchCovers[item.thumbnail] = `/${fileName}`;
            } catch { this.warn('A reel cover keeps its live image fallback.'); }
          }
        } catch { this.warn('Reel cover catalogue unavailable; live images remain available.'); }
        this.emitFile({ type: 'asset', fileName: 'watch-covers.json', source: JSON.stringify(watchCovers) });
        return `export default ${JSON.stringify(watchCovers)};`;
      }
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
              const avif = await sharp(buffer).resize({ width, withoutEnlargement: true }).avif({ quality: 50, effort: 6 }).toBuffer();
              this.emitFile({ type: 'asset', fileName: `optimized/hero-${basename}-${width}.avif`, source: avif });
            }
            slides.push({ id: slide.id, image: slide.image, link_url: slide.link_url, optimizedImage: `/optimized/hero-${basename}-1600.webp`, mobileImage: `/optimized/hero-${basename}-768.webp`, optimizedAvif: `/optimized/hero-${basename}-1600.avif`, mobileAvif: `/optimized/hero-${basename}-768.avif` });
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
          rel: 'preload', as: 'image', type: 'image/avif', href: firstHero.optimizedAvif,
          imagesrcset: `${firstHero.mobileAvif} 768w, ${firstHero.optimizedAvif} 1600w`,
          imagesizes: '100vw', fetchpriority: 'high',
        } }];
      },
    },
    async generateBundle() {
      for (const index of [1, 2, 3]) {
        const image = await sharp(await readFile(`src/assets/b${index}.jpeg`)).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        this.emitFile({ type: 'asset', fileName: `optimized/blog-${index}.webp`, source: image });
      }
      for (let index = 1; index <= 5; index++) {
        const name = `story-${String(index).padStart(2, '0')}`;
        const poster = await readFile(`public/journey/assets/${name}-start.webp`);
        for (const width of [768, 1600]) {
          const image = await sharp(poster).resize({ width, withoutEnlargement: true }).avif({ quality: index === 1 ? 60 : 55, effort: 5 }).toBuffer();
          this.emitFile({ type: 'asset', fileName: `optimized/journey-${index === 1 ? 'first' : name}-${width}.avif`, source: image });
        }
      }
      for (const room of ['living-room', 'bedroom', 'office']) {
        const poster = await readFile(`public/journey/assets/${room}-start.webp`);
        for (const width of [320, 640, 1280]) {
          const image = await sharp(poster).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
          this.emitFile({ type: 'asset', fileName: `optimized/journey-${room}-${width}.webp`, source: image });
        }
      }
      for (const name of (await readdir('public/category-images')).filter(name => name.endsWith('-original-pot-v2.webp'))) {
        const poster = await readFile(`public/category-images/${name}`);
        for (const width of [320, 480]) {
          const image = await sharp(poster).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
          this.emitFile({ type: 'asset', fileName: `optimized/category-${name.replace('.webp', '')}-${width}.webp`, source: image });
        }
      }
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
    },
  };
}
