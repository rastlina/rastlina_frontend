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
              key={size.id}
              onClick={() => onSelect(size.id)}
              disabled={!available}
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
  onSelect: (colorId: number) => void;
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
  const visibleColors = getColorsForSize(variants, colors, selectedSizeId);

  if (visibleColors.length === 0) return null;

  const selectedName = visibleColors.find(c => c.id === selectedColorId)?.name;

  return (
    <div className="space-y-3 pt-1">
      <h3 className="font-extrabold text-gray-900 text-base tracking-tight">
        Color:{' '}
        <span className="font-semibold text-gray-600">
          {selectedName ?? 'Select a color'}
        </span>
      </h3>

      <div className="flex flex-wrap gap-3">
        {visibleColors.map(color => {
          const availability = isColorAvailableForSize(variants, color.id, selectedSizeId);
          // availability === null → combination doesn't exist → skip (hidden)
          if (availability === null) return null;

          const isSelected = selectedColorId === color.id;
          const isOutOfStock = availability === false;

          return (
            <button
              key={color.id}
              onClick={() => !isOutOfStock && onSelect(color.id)}
              title={isOutOfStock ? `${color.name} — Out of Stock` : color.name}
              className={[
                'relative flex flex-col items-center gap-1.5 group',
                isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ].join(' ')}
            >
              {/* Outer ring — selected state */}
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-[#1A3831] scale-110'
                    : 'ring-1 ring-transparent hover:ring-gray-300',
                ].join(' ')}
              >
                {/* Color swatch — exact hex from backend */}
                <div
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                  style={{ backgroundColor: color.hex_code }} // NO hardcoded fallback
                />
              </div>

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
              <span className="text-[10px] font-bold text-gray-500 max-w-[48px] text-center leading-tight">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};