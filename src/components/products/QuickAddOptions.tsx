import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/utils/variantHelpers';
import type { ApiProductDetail, ProductVariant } from '@/pages/ProductDetail';

export default function QuickAddOptions({ product, onClose, onAdd }: {
  product: ApiProductDetail; onClose: () => void; onAdd: (variant: ProductVariant) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const adding = useRef(false);
  const selected = product.variants.find(variant => variant.id === selectedId);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="w-[calc(100%_-_32px)] max-h-[85dvh] overflow-y-auto rounded-2xl bg-[#fffdf7] text-[#18392a] [&>button:last-child]:grid [&>button:last-child]:place-items-center [&>button:last-child]:h-11 [&>button:last-child]:w-11 [&>button:last-child]:top-1 [&>button:last-child]:right-1"
      onCloseAutoFocus={event => { if (adding.current) event.preventDefault(); }}>
      <DialogTitle className="pr-6 leading-snug">{product.name}</DialogTitle>
      <DialogDescription>Select your size and pot colour to add this plant to your cart.</DialogDescription>
      <fieldset className="space-y-2">
        <legend className="sr-only">Plant options</legend>
        {product.variants.map(variant => <label key={variant.id} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3 ${selectedId === variant.id ? 'border-[#18392a] bg-[#edf2eb]' : 'border-[#d4dccc]'}`}>
          <input type="radio" name={`quick-add-${product.id}`} checked={selectedId === variant.id} onChange={() => setSelectedId(variant.id)}
            className="h-4 w-4 accent-[#18392a]" />
          <span className="flex-1 text-sm">{[variant.size_name, variant.color_name].filter(Boolean).join(' · ') || 'Standard'}</span>
          <strong className="text-sm">{formatPrice(variant.final_price)}</strong>
        </label>)}
      </fieldset>
      <button type="button" disabled={!selected} onClick={() => { if (selected) { adding.current = true; onAdd(selected); } }}
        className="min-h-12 rounded-lg bg-[#18392a] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
        Add to Cart{selected ? ` — ${formatPrice(selected.final_price)}` : ''}
      </button>
    </DialogContent>
  </Dialog>;
}
