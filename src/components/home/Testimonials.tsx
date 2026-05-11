// src/components/home/Testimonials.tsx
// Fetches featured reviews from API. Falls back to hardcoded testimonials
// only if the API returns zero featured reviews (e.g. no reviews marked featured yet).
import { Star, Quote } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';

// Static fallback — only shown when DB has no featured reviews yet
const STATIC_REVIEWS = [
  {
    id: 1, user_name: 'Samriddhi G.', role: 'Home Gardener', rating: 5,
    comment: 'Absolutely love the plant! It arrived healthy and brightens up my entire home.',
  },
  {
    id: 2, user_name: 'Rajiv D.', role: 'Interior Designer', rating: 5,
    comment: 'Received a vibrant and well-packaged plant. It looks stunning in my living room.',
  },
  {
    id: 3, user_name: 'Shridhar H.', role: 'Plant Parent', rating: 5,
    comment: 'Amazing service! The plant arrived healthy and adds a lovely touch to my space.',
  },
];

const SkeletonCard = () => (
  <div className="min-w-[85%] md:min-w-0 snap-center bg-white rounded-2xl p-7 border border-gray-100 animate-pulse">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-12 h-12 rounded-full bg-gray-100" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

const Testimonials = () => {
  const { data, loading } = useHomeData();
  const apiReviews = data.featured_reviews;

  // Use API reviews if available, else static fallback
  const reviews = apiReviews.length > 0 ? apiReviews : STATIC_REVIEWS;

  return (
    <section className="py-16 bg-[#FAFAF8]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
            What Our Customers Say
          </h2>
          <div className="w-20 h-1 bg-[#BFA275] mx-auto rounded-full" />
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div
          className="flex overflow-x-auto snap-x gap-5 pb-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="min-w-[85%] md:min-w-0 snap-center bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300 relative flex flex-col"
                >
                  <Quote className="absolute top-5 right-5 h-7 w-7 text-gray-100 fill-current" />

                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-[#F0F4E8] text-[#667D00] rounded-full flex items-center justify-center font-extrabold text-base flex-shrink-0">
                      {(review.user_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">
                        {review.user_name}
                      </p>
                      {review.role && (
                        <p className="text-xs text-gray-400">{review.role}</p>
                      )}
                      {review.is_verified_purchase && (
                        <p className="text-[10px] text-[#667D00] font-bold">✓ Verified Buyer</p>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= review.rating ? 'fill-[#BFA275] text-[#BFA275]' : 'fill-gray-100 text-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-gray-600 text-sm leading-relaxed italic flex-1">
                    "{review.comment}"
                  </p>

                  {review.date && (
                    <p className="text-[10px] text-gray-300 font-medium mt-4 uppercase tracking-wider">
                      {review.date}
                    </p>
                  )}
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
};

export default Testimonials;