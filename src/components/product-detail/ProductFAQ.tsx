import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export interface FAQ {  // Add 'export' here
  id: number;
  question: string;
  answer: string;
  order: number; 
}

interface ProductFAQProps {
  faqs: FAQ[]; 
}

export const ProductFAQ = ({ faqs }: ProductFAQProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  // Sort by order to ensure sequence matches Django Admin[cite: 41]
  const sortedFaqs = [...faqs].sort((a, b) => a.order - b.order);

  return (
    <section className="py-16 bg-muted border-t border-gray-200">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-10 flex flex-col items-center">
          <HelpCircle className="h-10 w-10 text-primary mb-3" />
          <h2 className="text-3xl font-serif font-extrabold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 mt-2">Everything you need to know about our plants and services</p>
        </div>

        <div className="space-y-4">
          {sortedFaqs.map((faq, index) => (
            <div 
              key={faq.id} 
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex justify-between items-center text-left"
              >
                <span className="font-extrabold text-gray-900 text-lg">
                  {faq.question}
                </span>
                {openFaq === index ? (
                  <Minus className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0 text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};