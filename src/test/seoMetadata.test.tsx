import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, expect, it } from 'vitest';
import { Seo } from '@/components/seo/Seo';
import { canonicalUrl, schemaJson } from '@/lib/seoUrls';
import { publicPages } from '@/components/seo/RouteSeo';
import { blogs } from '@/data/blogs';

afterEach(() => { HelmetProvider.canUseDOM = true; });

it('consolidates sorting/tracking URLs while retaining meaningful filters and category paths', () => {
  expect(canonicalUrl('/shop?ordering=price&utm_source=instagram&fbclid=123')).toBe('https://www.rastlina.com/shop');
  expect(canonicalUrl('/shop?space=bedroom&category=plants&ordering=-price')).toBe('https://www.rastlina.com/shop?category=plants&space=bedroom');
  expect(canonicalUrl('/shop/indoor-plants?utm_campaign=test')).toBe('https://www.rastlina.com/shop/indoor-plants');
  expect(canonicalUrl('/product/snake-plant#reviews')).toBe('https://www.rastlina.com/product/snake-plant');
  expect(() => canonicalUrl('https://example.com/')).toThrow();
});

it('escapes script-closing characters while retaining valid schema JSON', () => {
  const value = { name: '</script><script>alert(1)</script>' };
  expect(schemaJson(value)).not.toContain('</script>');
  expect(JSON.parse(schemaJson(value))).toEqual(value);
});

it('provides canonical, title and description metadata for every public static shell', () => {
  HelmetProvider.canUseDOM = false;
  for (const [path, metadata] of Object.entries(publicPages)) {
    const context: { helmet?: { title: { toString(): string }; meta: { toString(): string }; link: { toString(): string } } } = {};
    renderToString(<HelmetProvider context={context}><Seo {...metadata} path={path} /></HelmetProvider>);
    expect(context.helmet!.title.toString()).toContain('Rastlina');
    expect(context.helmet!.meta.toString()).toContain('name="description"');
    expect(context.helmet!.link.toString()).toContain(`https://www.rastlina.com${path}`);
  }
});

it('preserves article publication dates using explicit ISO dates', () => {
  expect(blogs.map(blog => blog.publishedDate)).toEqual(['2025-10-12', '2025-09-28', '2025-09-15']);
});
