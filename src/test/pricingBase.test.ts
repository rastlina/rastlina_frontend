import { expect, it } from 'vitest';
import { pricingBase } from '@/services/pricingBase';

it('connects both live storefront hosts directly to the authoritative backend', () => {
  expect(pricingBase('rastlina.com')).toBe('https://admin.rastlina.com/api/store');
  expect(pricingBase('www.rastlina.com', 'https://admin.rastlina.com/api/')).toBe('https://admin.rastlina.com/api/store');
});

it('keeps previews, local development and server rendering on the fixed same-origin route', () => {
  for (const host of ['preview.vercel.app', 'localhost', '', 'rastlina.com.untrusted.invalid']) {
    expect(pricingBase(host)).toBe('/api/store');
  }
});
