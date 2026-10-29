// src/components/product-detail/ProductSelector.tsx
import React from 'react';
import type { ProductVariant } from '@/pages/ProductDetail';
import {
  getUniqueSizes,
  getColorsForSize,
  isSizeAvailable,
  isColorAvailableForSize,
} from '@/utils/variantHelpers';

// ─── Size Selector ────────────────────────────────────────────────────────────

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedSizeId: number | null;
  selectedColorId: number | null;
  onSelect: (sizeId: number) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  variants,
  selectedSizeId,
  selectedColorId,
  onSelect,
}) => {
  const sizes = getUniqueSizes(variants);

  if (sizes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
        Size:{' '}
        <span className="font-semibold text-gray-600">
          {sizes.find(s => s.id === selectedSizeId)?.name ?? 'Select'}
        </span>
      </h3>

      <div className="flex flex-wrap gap-3">
        {sizes.map(size => {
          const isSelected = selectedSizeId === size.id;
          const available = isSizeAvailable(variants, size.id);

          return (
            <button
              type="button"
              key={size.id}
              onClick={() => onSelect(size.id)}
              disabled={!available}
              aria-pressed={isSelected}
              className={[
                'relative px-5 py-3 rounded-xl border-2 transition-all text-sm font-extrabold min-w-[80px]',
                isSelected
                  ? 'border-[#1A3831] bg-[#1A3831] text-white shadow-md'
                  : available
                  ? 'border-gray-200 bg-white text-gray-900 hover:border-[#1A3831] hover:text-[#1A3831]'
                  : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed',
              ].join(' ')}
            >
              {/* Struck-through line for unavailable sizes */}
              {!available && !isSelected && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="absolute w-full h-px bg-gray-300 rotate-[15deg]" />
                </span>
              )}
              {size.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Color Selector ───────────────────────────────────────────────────────────

interface ColorSelectorProps {
  colors: Array<{ id: number; name: string; hex_code: string }>;
  variants: ProductVariant[];
  selectedColorId: number | null;
  selectedSizeId: number | null;
  onSelect: (colorId: number | null) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  variants,
  selectedColorId,
  selectedSizeId,
  onSelect,
}) => {
  // Only show colors that exist for the currently selected size
  // If no size selected, show all colors
  const namedColors = getColorsForSize(variants, colors, selectedSizeId);
  // These Rastlina sets include the original ivory self-watering pot. Legacy
  // products store that option as an unnamed (null-colour) variant. Show its
  // included colour without inventing a colour ID or changing stock/selection.
  const includedIvory = namedColors.length === 0 && variants.some(variant =>
    variant.color_id === null && (selectedSizeId === null || variant.size_id === selectedSizeId));
  const visibleColors: Array<{ id: number | null; name: string; hex_code: string }> = includedIvory
    ? [{ id: null, name: 'Ivory', hex_code: '#F4F0E5' }]
    : namedColors;

  if (visibleColors.length === 0) return null;

  const selectedName = visibleColors.find(c => c.id === selectedColorId)?.name;

  return (
    <div className="space-y-3">
      <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
        Pot colour:{' '}
        <span className="font-semibold text-gray-600">
          {selectedName ?? 'Select a color'}
        </span>
      </h3>

      <div className="flex flex-wrap gap-3">
        {visibleColors.map(color => {
          const availability = color.id === null
            ? variants.some(variant => variant.color_id === null &&
              (selectedSizeId === null || variant.size_id === selectedSizeId) && variant.stock > 0)
            : isColorAvailableForSize(variants, color.id, selectedSizeId);
          // availability === null → combination doesn't exist → skip (hidden)
          if (availability === null) return null;

          const isSelected = selectedColorId === color.id;
          const isOutOfStock = availability === false;

          return (
            <button
              type="button"
              key={color.id ?? 'included-ivory'}
              onClick={() => !isOutOfStock && onSelect(color.id)}
              disabled={isOutOfStock}
              aria-pressed={isSelected}
              title={isOutOfStock ? `${color.name} — Out of Stock` : color.name}
              className={[
                'relative inline-flex min-h-12 items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors',
                isSelected ? 'border-[#1A3831] bg-[#F7F7F0] text-[#1A3831]' : 'border-gray-200 bg-white text-gray-700 hover:border-[#1A3831]',
                isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
                <div
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 rounded-full border border-gray-300 shadow-inner"
                  style={{ backgroundColor: color.hex_code }}
                />

              {/* Sold out X overlay */}
              {isOutOfStock && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                  <svg viewBox="0 0 8 8" className="w-2 h-2">
                    <line x1="1" y1="1" x2="7" y2="7" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="7" y1="1" x2="1" y2="7" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              {/* Color name label */}
              <span className="text-sm leading-tight">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
