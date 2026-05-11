// src/components/home/CreativeCategories.tsx
// Fetches featured categories dynamically from /store/home-data/.
// Circular image cards in a horizontal scrolling row.
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';

const SkeletonCircle = () => (
  <div className="flex flex-col items-center gap-2 flex-shrink-0">
    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-100 animate-pulse" />
    <div className="h-3 w-14 bg-gray-100 rounded animate-pulse" />
  </div>
);

const CreativeCategories = () => {
  const { data, loading } = useHomeData();
  const categories = data.featured_categories;

  return (
    <section className="py-8 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1A3831]">
            Explore by Category
          </h2>
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#667D00] hover:text-[#1A3831] flex items-center gap-0.5 transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div
  className="
    flex gap-5 md:gap-10
    overflow-x-auto md:overflow-visible
    pb-3 snap-x no-scrollbar px-1
    md:justify-center
  "
  style={{ scrollbarWidth: 'none' }}
>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCircle key={i} />)
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2 flex-shrink-0 snap-start"
                >
                  {/* Circle */}
                  <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#BFA275] transition-all duration-300 p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F0F4E8] flex items-center justify-center">
                          <span className="text-2xl">🌿</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] md:text-xs font-semibold text-gray-600 group-hover:text-[#1A3831] transition-colors text-center w-16 md:w-24 leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))
          }
        </div>
      </div>
    </section>
  );
};

export default CreativeCategories;