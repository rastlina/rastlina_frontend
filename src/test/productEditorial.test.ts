import { describe, expect, it } from 'vitest';
import { applyProductEditorial, reviewedProductSkus } from '@/data/productEditorial';
import type { ApiProductDetail } from '@/pages/ProductDetail';

function fixture(sku: string, name = 'Plant') {
  return { sku, name, slug: 'existing-url', price: '299.00', variants: [], images: [], description: '', care_instructions_list: [] } as unknown as ApiProductDetail;
}

describe('reviewed product content', () => {
  it.each([
    ['AGLA-01', 'Aglaonema Chinese Evergreen'],
    ['SET2-07', 'Aglaonema Lipstick Red | Jade - Set of 2'],
  ])('shows saved admin copy for %s without replacing its emoji lines', (sku, name) => {
    const description = `🌿 ${name}: A living gift for home and office.\n🌱 Check the soil before watering.\n🌞 Choose suitable light.\n🪴 Includes a self-watering pot.\n🎁 A thoughtful plant gift.`;
    const product = applyProductEditorial({ ...fixture(sku, name), description });
    expect(product.description).toBe(description);
    expect(product.care_instructions_list.length).toBeGreaterThanOrEqual(4);
    expect(product.slug).toBe('existing-url');
    expect(product.price).toBe('299.00');
  });
  it('uses the reviewed fallback when the admin description contains only whitespace', () => {
    const product = applyProductEditorial({ ...fixture('SNAK-02', 'Snake Green'), description: ' \n ' });
    expect(product.description).toContain('Snake Green');
    expect(product.description).toContain('self-watering pot and soil mix');
  });
  it('covers unique reviewed SKUs with description, care and included items', () => {
    expect(new Set(reviewedProductSkus).size).toBe(reviewedProductSkus.length);
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
    expect(applyProductEditorial(fixture('SNAK-02', 'Snake Green')).watering).toContain('dry well');
    expect(applyProductEditorial(fixture('JADE-01', 'Jade Plant')).watering).toContain('dry between');
    const combo = applyProductEditorial(fixture('SET2-06', 'Snake & Jade - Set of 2'));
    expect(combo.care_instructions_list[0]).toContain('dry well');
    expect(combo.care_instructions_list[1]).toContain('dry between');
  });
  it('preserves the current cultivar when a SKU has been reused', () => {
    const renamed = applyProductEditorial(fixture('PHIL-01', 'Philodendron Bellavita'));
    expect(renamed.name).toBe('Philodendron Bellavita');
    expect(renamed.description).not.toContain('Billietiae');
  });
  it('uses the current bundle members rather than an older SKU recipe', () => {
    const bundle = applyProductEditorial(fixture('SET3-05', "Money Plant 'N' Joy | Calathea Ornata | Syngonium Pink - Set of 3"));
    expect(bundle.care_instructions_list[0]).toContain("Money Plant 'N' Joy");
    expect(bundle.care_instructions_list[1]).toContain('Calathea Ornata');
    expect(bundle.description).not.toMatch(/Suksom|Silver Sword|Peperomia/);
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
