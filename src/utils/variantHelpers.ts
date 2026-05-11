// src/utils/variantHelpers.ts
// Centralized variant availability + image filtering logic
// Used by ProductDetail, ProductSelector, ProductCard, CartContext

import type { ProductVariant, ProductImage } from '@/pages/ProductDetail';

// ─── Variant Lookup ───────────────────────────────────────────────────────────

/**
 * Find the exact variant for a size+color combination.
 * Falls back to size-only (color_id=null) if no color variant exists.
 */
export function findVariant(
  variants: ProductVariant[],
  sizeId: number | null,
  colorId: number | null,
): ProductVariant | null {
  if (!sizeId) return null;
  // Exact size+color match
  const exact = variants.find(v => v.size_id === sizeId && v.color_id === colorId);
  if (exact) return exact;
  // Size-only fallback (product has no color dimension)
  return variants.find(v => v.size_id === sizeId && v.color_id === null) ?? null;
}

/**
 * Check if a specific size+color combination exists AND has stock > 0.
 * Returns null if the combination doesn't exist (don't show sold-out).
 * Returns false only when combination exists but stock === 0.
 */
export function getVariantStock(
  variants: ProductVariant[],
  sizeId: number | null,
  colorId: number | null,
): number | null {
  const v = findVariant(variants, sizeId, colorId);
  if (!v) return null; // combination doesn't exist
  return v.stock;
}

// ─── Size / Color Availability ────────────────────────────────────────────────

/** Get unique sizes from variants, preserving backend order */
export function getUniqueSizes(
  variants: ProductVariant[],
): Array<{ id: number; name: string }> {
  const seen = new Set<number>();
  const result: Array<{ id: number; name: string }> = [];
  for (const v of variants) {
    if (!seen.has(v.size_id)) {
      seen.add(v.size_id);
      result.push({ id: v.size_id, name: v.size_name });
    }
  }
  return result;
}

/**
 * Get colors available for a specific size.
 * If sizeId is null, returns all colors across all variants.
 */
export function getColorsForSize(
  variants: ProductVariant[],
  allColors: Array<{ id: number; name: string; hex_code: string }>,
  sizeId: number | null,
): Array<{ id: number; name: string; hex_code: string }> {
  const colorIdsForSize = new Set(
    variants
      .filter(v => sizeId === null || v.size_id === sizeId)
      .filter(v => v.color_id !== null)
      .map(v => v.color_id as number),
  );
  return allColors.filter(c => colorIdsForSize.has(c.id));
}

/**
 * Is this size available (has at least one variant with stock > 0)?
 * Used to show/disable size buttons.
 */
export function isSizeAvailable(
  variants: ProductVariant[],
  sizeId: number,
): boolean {
  return variants.some(v => v.size_id === sizeId && v.stock > 0);
}

/**
 * Is this color available for the selected size AND has stock?
 * Returns null if the combination doesn't exist at all (hide, not disable).
 * Returns false if combination exists but out of stock.
 */
export function isColorAvailableForSize(
  variants: ProductVariant[],
  colorId: number,
  sizeId: number | null,
): boolean | null {
  if (!sizeId) {
    // No size selected — just check if color exists anywhere
    const exists = variants.some(v => v.color_id === colorId);
    return exists ? variants.some(v => v.color_id === colorId && v.stock > 0) : null;
  }
  const v = variants.find(v => v.size_id === sizeId && v.color_id === colorId);
  if (!v) return null; // combination doesn't exist — hide this color
  return v.stock > 0;
}

// ─── Image Filtering ──────────────────────────────────────────────────────────

/**
 * Filter images for the selected color.
 * - If colorId is null → return all images
 * - Color-specific images come first, then generic (color_id=null) images
 * - If no color-specific images exist → return all images
 */
export function imagesForColor(
  images: ProductImage[],
  colorId: number | null,
): ProductImage[] {
  if (!colorId) return images;
  const colorSpecific = images.filter(img => img.color_id === colorId);
  const generic = images.filter(img => img.color_id === null);
  return colorSpecific.length > 0 ? [...colorSpecific, ...generic] : images;
}

// ─── Price Calculation ────────────────────────────────────────────────────────

export const formatPrice = (v: number | string | null): string => {
  if (v === null || v === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(v));
};