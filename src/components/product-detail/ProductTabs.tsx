// src/components/product-detail/ProductTabs.tsx
import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Sun, Thermometer, Ruler, PawPrint,
  Check, Leaf, Sprout,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ApiProductDetail } from '@/pages/ProductDetail';

interface ProductTabsProps {
  product: ApiProductDetail;
  compact?: boolean;
  showDescription?: boolean;
}

type TabId = 'description' | 'care' | 'included';

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const ProductTabs = ({ product, compact = false, showDescription = true }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>(showDescription ? 'description' : 'care');
  const tabId = useId();

  // The universal pot tip keeps Care Guide useful even without structured fields.
  const tabs = ([
    {
      id: 'description',
      label: 'Description',
      hasContent: showDescription && !!product.description,
    },
    {
      id: 'care',
      label: 'Care Guide',
      hasContent: true,
    },
    {
      id: 'included',
      label: "What's Included",
      hasContent: product.what_you_get_list?.length > 0,
    },
  ] as const).filter(t => t.hasContent);

  if (tabs.length === 0) return null;
  const selectedTab = tabs.some(tab => tab.id === activeTab) ? activeTab : tabs[0].id;

  // Care quick-stat cards (from structured fields)
  const careCards = [
    product.sunlight && {
      icon: Sun, label: 'Sunlight', value: product.sunlight,
    },
    product.watering && {
      icon: Droplets, label: 'Watering', value: product.watering,
    },
    product.temperature && {
      icon: Thermometer, label: 'Temperature', value: product.temperature,
    },
    {
      // Reservoir and drainage guidance: Illinois Extension, Container Drainage Options.
      // https://extension.illinois.edu/container-gardens/container-drainage-options
      icon: Sprout, label: 'Self-watering pot',
      value: 'Soil draws moisture from the reservoir for roots to absorb.',
    },
    product.growth_rate && {
      icon: Ruler, label: 'Growth Rate', value: product.growth_rate,
    },
    product.pet_friendly !== null && product.pet_friendly !== undefined && {
      icon: PawPrint, label: 'Pet Friendly', value: product.pet_friendly ? '✓ Safe' : '✗ Not Safe',
    },
    product.air_purifying && {
      icon: Leaf, label: 'Air Purifying', value: 'Yes',
    },
  ].filter(Boolean) as Array<{ icon: LucideIcon; label: string; value: string }>;

  return (
    <section aria-label="Product details" className={compact ? 'rounded-2xl border border-[#DEE5DA] bg-[#FAFAF8]' : 'bg-[#FAFAF8] border-y border-gray-200'}>
      <div className={compact ? 'p-4 sm:p-5' : 'container-custom py-12'}>
        {/* Tab buttons */}
        <div role="tablist" aria-label="Product information" className={`flex gap-0 border-b border-gray-200 ${compact ? 'mb-4' : 'mb-8 overflow-x-auto no-scrollbar'}`}>
          {tabs.map(tab => (
            <button
              type="button"
              role="tab"
              id={`${tabId}-${tab.id}`}
              aria-selected={selectedTab === tab.id}
              aria-controls={`${tabId}-panel`}
              tabIndex={selectedTab === tab.id ? 0 : -1}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const current = tabs.findIndex(item => item.id === tab.id);
                const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
                  : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                setActiveTab(tabs[index].id);
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
              }}
              className={[
                'min-h-11 font-semibold transition-all border-b-[3px] -mb-px',
                compact ? 'min-w-0 flex-1 whitespace-normal px-1 pb-3 text-xs leading-snug sm:text-sm' : 'whitespace-nowrap pb-4 px-6 text-sm',
                selectedTab === tab.id
                  ? 'border-[#1A3831] text-[#1A3831]'
                  : 'border-transparent text-gray-400 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${selectedTab}`} tabIndex={0} className={compact ? '' : 'min-h-[180px]'}>
          <AnimatePresence mode="wait">
            {/* ── Description ── */}
            {selectedTab === 'description' && (
              <motion.div
                key="description"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-3xl space-y-4"
              >
                <p className={`text-gray-700 leading-relaxed whitespace-pre-line ${compact ? 'text-sm' : 'font-medium text-base md:text-lg'}`}>
                  {product.description}
                </p>
              </motion.div>
            )}

            {/* ── Care Guide ── */}
            {selectedTab === 'care' && (
              <motion.div
                key="care"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-8"
              >
                {/* Quick stat cards from structured fields */}
                {careCards.length > 0 && (
                  <div className={compact ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'}>
                    {careCards.map(card => (
                      <div
                        key={card.label}
                        className={`min-w-0 break-words bg-white rounded-xl text-center border border-gray-100 ${compact ? 'p-3' : 'p-5 shadow-sm'}`}
                      >
                        <card.icon className="h-6 w-6 text-[#667D00] mx-auto mb-2" />
                        <p className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mb-1">
                          {card.label}
                        </p>
                        <p className="font-extrabold text-gray-900 text-sm leading-tight">
                          {card.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Detailed care instructions — from text field */}
                {product.care_instructions_list?.length > 0 && (
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 mb-4">
                      Detailed Care Instructions
                    </h3>
                    <ul className="space-y-3">
                      {product.care_instructions_list.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-[#667D00]/10 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="h-3.5 w-3.5 text-[#667D00]" />
                          </div>
                          <span className="text-gray-700 font-medium text-sm leading-relaxed">
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── What's Included ── */}
            {selectedTab === 'included' && (
              <motion.div
                key="included"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={compact ? 'space-y-3' : 'max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100'}>
                  <h3 className="font-extrabold text-gray-900 mb-5 text-base">
                    In the Box
                  </h3>
                  <ul className="space-y-3.5">
                    {product.what_you_get_list.map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#667D00]/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="h-3.5 w-3.5 text-[#667D00]" />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
