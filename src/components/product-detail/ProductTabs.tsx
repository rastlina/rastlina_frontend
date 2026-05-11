// src/components/product-detail/ProductTabs.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Sun, Thermometer, Ruler, PawPrint,
  Check, Leaf, ShieldCheck,
} from 'lucide-react';
import type { ApiProductDetail } from '@/pages/ProductDetail';

interface ProductTabsProps {
  product: ApiProductDetail;
}

type TabId = 'description' | 'care' | 'included';

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<TabId>('description');

  // Only show tabs with content
// Only show tabs with content
  const tabs = ([
    {
      id: 'description',
      label: 'Description',
      hasContent: !!product.description,
    },
    {
      id: 'care',
      label: 'Care Guide',
      hasContent: !!(
        product.sunlight || product.watering || product.temperature ||
        product.growth_rate || product.care_instructions_list?.length
      ),
    },
    {
      id: 'included',
      label: "What's Included",
      hasContent: product.what_you_get_list?.length > 0,
    },
  ] as const).filter(t => t.hasContent);

  if (tabs.length === 0) return null;

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
    product.growth_rate && {
      icon: Ruler, label: 'Growth Rate', value: product.growth_rate,
    },
    product.pet_friendly !== null && product.pet_friendly !== undefined && {
      icon: PawPrint, label: 'Pet Friendly', value: product.pet_friendly ? '✓ Safe' : '✗ Not Safe',
    },
    product.air_purifying && {
      icon: Leaf, label: 'Air Purifying', value: 'Yes',
    },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string }>;

  return (
    <section className="bg-[#FAFAF8] border-y border-gray-200">
      <div className="container-custom py-12">
        {/* Tab buttons */}
        <div className="flex gap-0 mb-8 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'pb-4 px-6 font-extrabold whitespace-nowrap transition-all border-b-[3px] -mb-px text-sm',
                activeTab === tab.id
                  ? 'border-[#1A3831] text-[#1A3831]'
                  : 'border-transparent text-gray-400 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[180px]">
          <AnimatePresence mode="wait">
            {/* ── Description ── */}
            {activeTab === 'description' && (
              <motion.div
                key="description"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="max-w-3xl space-y-4"
              >
                <p className="text-gray-700 font-medium leading-relaxed text-base md:text-lg whitespace-pre-line">
                  {product.description}
                </p>
              </motion.div>
            )}

            {/* ── Care Guide ── */}
            {activeTab === 'care' && (
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {careCards.map(card => (
                      <div
                        key={card.label}
                        className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100"
                      >
                        <card.icon className="h-6 w-6 text-[#667D00] mx-auto mb-2" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
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
            {activeTab === 'included' && (
              <motion.div
                key="included"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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