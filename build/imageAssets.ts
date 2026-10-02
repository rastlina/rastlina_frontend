import type { Plugin } from 'vite';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

export function imageAssets(): Plugin {
  return {
    name: 'rastlina-image-assets',
    apply: 'build',
    async generateBundle() {
      for (const [source, output, width] of [
        ['logo.png', 'logo-optimized.webp', 520],
        ['self-watering-banner.png', 'self-watering-banner-optimized.webp', 1400],
      ] as const) {
        const input = await readFile(`public/${source}`);
        const optimized = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        this.emitFile({ type: 'asset', fileName: output, source: optimized });
        console.log(`${source}: ${input.length} -> ${optimized.length} bytes`);
      }
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
