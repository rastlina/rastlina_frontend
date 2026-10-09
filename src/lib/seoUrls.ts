export const SITE_URL = 'https://www.rastlina.com';

export function canonicalUrl(path: string) {
  const url = new URL(path, SITE_URL);
  // A canonical must always point to this storefront, never an external URL.
  if (url.origin !== SITE_URL) throw new Error('Canonical URL must belong to Rastlina');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^utm_/i.test(key) || /^(gclid|fbclid|msclkid)$/i.test(key) ||
      (url.pathname.startsWith('/shop') && key === 'ordering')) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.toString();
}

export function schemaJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
