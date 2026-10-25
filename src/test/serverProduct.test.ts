import { afterEach, expect, it } from 'vitest';
import { serverProduct } from '@/lib/serverProduct';

const product = { slug: 'jade', price: '199.00', variants: [{ id: 1, in_stock: true }], images: [], available_sizes: [], available_colors: [] };
function seed(value: unknown) {
  const script = document.createElement('script'); script.id = 'rastlina-product-data';
  script.type = 'application/json'; script.textContent = JSON.stringify(value); document.body.appendChild(script);
}
afterEach(() => { document.getElementById('rastlina-product-data')?.remove(); localStorage.clear(); });
it('reuses the current public server quote and variants', () => {
  seed({ product, generatedAt: Date.now() });
  expect(serverProduct('jade')).toEqual(product);
  expect(serverProduct('calathea')).toBeNull();
});
it('rejects old quotes and authenticated sessions', () => {
  seed({ product, generatedAt: Date.now() - 121000 });
  expect(serverProduct('jade')).toBeNull();
  document.getElementById('rastlina-product-data')!.remove(); seed({ product, generatedAt: Date.now() });
  localStorage.setItem('rastlinaToken', 'test-token'); expect(serverProduct('jade')).toBeNull();
});
it('falls back safely for malformed or incomplete data', () => {
  seed({ product: { slug: 'jade' }, generatedAt: Date.now() });
  expect(serverProduct('jade')).toBeNull();
  document.getElementById('rastlina-product-data')!.textContent = '{invalid';
  expect(serverProduct('jade')).toBeNull();
});
