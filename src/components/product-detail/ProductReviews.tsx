// src/components/product-detail/ProductReviews.tsx
import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService, storeService } from '@/services/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductVariant } from '@/pages/ProductDetail';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  title?: string;
  comment: string;
  variant_info: string;
  is_verified_purchase: boolean;
  date: string;
}

interface ProductReviewsProps {
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
  productSlug: string;
  activeVariant?: ProductVariant | null;
}

export const ProductReviews = ({
  reviews,
  reviewCount,
  averageRating,
  productSlug,
  activeVariant,
}: ProductReviewsProps) => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (authService.isLoggedIn()) setUser(authService.getStoredUser());
  }, []);

  const hasReviews = reviewCount > 0;

  const handleOpenForm = () => {
    if (!authService.isLoggedIn()) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter your review');
      return;
    }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('rating', rating.toString());
      fd.append('comment', comment.trim());

      // Capture exact variant: "Medium / Sage Green"
      const variantLabel = activeVariant
        ? [activeVariant.size_name, activeVariant.color_name].filter(Boolean).join(' / ')
        : 'Standard';
      fd.append('variant_info', variantLabel);

      await storeService.addReview(productSlug, fd);
      toast.success('Thank you! Your review has been submitted.');
      setIsFormOpen(false);
      setComment('');
      setRating(5);
      // Refresh page to show new review
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      toast.error('Failed to submit review. You may have already reviewed this product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-white border-b border-gray-100">
      <div className="container-custom">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-serif font-black text-gray-900 mb-3">
              Customer Reviews
            </h2>

            {/* Rating summary — only when reviews exist */}
            {hasReviews && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`h-5 w-5 ${s <= Math.round(averageRating) ? 'fill-[#BFA275] text-[#BFA275]' : 'text-gray-200 fill-gray-200'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-700">
                  {Number(averageRating).toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>

          {!isFormOpen && (
            <button
              onClick={handleOpenForm}
              className="self-start bg-[#1A3831] text-white px-8 py-3.5 rounded-full font-extrabold text-sm hover:bg-black transition-colors shadow-sm"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* ── Review Form ── */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-[#F8F7F4] rounded-3xl p-8 border border-gray-200 relative">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="absolute top-5 right-5 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>

                <h3 className="text-xl font-serif font-black mb-1 text-gray-900">
                  Share your experience
                </h3>
                {activeVariant && (
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    Reviewing:{' '}
                    <span className="font-bold text-[#667D00]">
                      {[activeVariant.size_name, activeVariant.color_name].filter(Boolean).join(' / ')}
                    </span>
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
                  {/* Star picker */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              s <= (hoverRating || rating)
                                ? 'fill-[#BFA275] text-[#BFA275]'
                                : 'text-gray-300 fill-gray-100'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Your Review
                    </label>
                    <textarea
                      required
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="What did you love? How is the plant doing?"
                      rows={4}
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 font-medium text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-[#667D00] focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1A3831] text-white px-10 py-3.5 rounded-xl font-black text-sm hover:bg-black transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Reviews Grid ── */}
        {hasReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Stars + date */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= review.rating
                              ? 'fill-[#BFA275] text-[#BFA275]'
                              : 'fill-gray-100 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                      {review.date}
                    </span>
                  </div>

                  {/* Review title */}
                  {review.title && (
                    <p className="font-extrabold text-gray-900 mb-2 text-sm">{review.title}</p>
                  )}

                  {/* Comment — text only */}
                  <p className="text-gray-600 font-medium leading-relaxed text-sm mb-6">
                    "{review.comment}"
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-[#F0F4E8] text-[#667D00] rounded-full flex items-center justify-center font-black text-sm flex-shrink-0">
                      {review.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-black text-gray-900 text-sm block leading-tight">
                        {review.user_name}
                      </span>
                      {review.is_verified_purchase && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3 w-3 text-[#667D00]" />
                          <span className="text-[9px] text-gray-400 font-bold uppercase">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant info badge */}
                  {review.variant_info && review.variant_info !== 'Standard' && (
                    <span className="text-[10px] bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-500">
                      {review.variant_info}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#F8F7F4] rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-base mb-2">No reviews yet</p>
            <p className="text-gray-300 text-sm">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};