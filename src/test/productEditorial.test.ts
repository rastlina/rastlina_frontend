import { describe, expect, it } from 'vitest';
import { applyProductEditorial, reviewedProductSkus } from '@/data/productEditorial';
import type { ApiProductDetail } from '@/pages/ProductDetail';

function fixture(sku: string, name = 'Plant') {
  return { sku, name, slug: 'existing-url', price: '299.00', variants: [], images: [], description: 'Original', care_instructions_list: [] } as unknown as ApiProductDetail;
}

describe('reviewed product content', () => {
  it('covers 71 unique existing SKUs with description, care and included items', () => {
    expect(new Set(reviewedProductSkus).size).toBe(71);
    for (const sku of reviewedProductSkus) {
      const product = applyProductEditorial(fixture(sku));
      expect(product.description).toContain('self-watering pot and soil mix');
      expect(product.care_instructions_list.length).toBeGreaterThanOrEqual(4);
      expect(product.what_you_get_list).toHaveLength(2);
      expect(product.slug).toBe('existing-url');
      expect(product.price).toBe('299.00');
    }
  });
  it('keeps unknown future products untouched', () => {
    const product = fixture('FUTURE-01');
    expect(applyProductEditorial(product)).toBe(product);
  });
  it('does not apply tropical watering to snake and jade plants', () => {
    expect(applyProductEditorial(fixture('SNAK-01')).watering).toContain('dry well');
    expect(applyProductEditorial(fixture('JADE-01')).watering).toContain('dry between');
    const combo = applyProductEditorial(fixture('SET2-06', 'Snake & Jade - Set of 2'));
    expect(combo.care_instructions_list[0]).toContain('dry well');
    expect(combo.care_instructions_list[1]).toContain('dry between');
  });
  it('does not publish blanket safe-for-pets or air-cleaning claims', () => {
    for (const sku of reviewedProductSkus) {
      const product = applyProductEditorial(fixture(sku));
      expect(product.pet_friendly).toBeNull();
      expect(product.air_purifying).toBe(false);
      expect(product.description).not.toMatch(/remov.*toxins|striking red flowers/i);
    }
  });
});
