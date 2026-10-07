// Featured categories retain their existing API images, names, and destinations.
import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';

const imageFrame =
  'aspect-square overflow-hidden rounded-[44%_44%_7%_7%] border-[8px] border-white bg-[#F0F4E8] shadow-[0_15px_24px_-15px_rgba(37,70,51,0.38)]';

const SkeletonCard = () => (
  <div className="min-w-0 snap-start" aria-hidden="true">
    <div className={`${imageFrame} animate-pulse`} />
    <div className="mt-4 h-4 w-32 animate-pulse rounded bg-gray-100" />
    <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
  </div>
);

const CreativeCategories = () => {
  const { data, loading } = useHomeData();
  const categories = data.featured_categories;

  return (
    <section className="bg-[#FBF8EF] py-8 md:py-10">
      <div className="container-custom">
        <h2 className="mb-6 font-serif text-xl font-bold text-[#1A3831] md:text-2xl">
          Explore by Category
        </h2>
        <div className="grid auto-cols-[180px] grid-flow-col gap-6 overflow-x-auto px-1 pb-6 pt-1 snap-x snap-proximity no-scrollbar md:auto-cols-auto md:grid-flow-row md:grid-cols-3 md:overflow-visible lg:grid-cols-5">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group min-w-0 snap-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3831] focus-visible:ring-offset-4"
              >
                <div className={imageFrame}>
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      width={320}
                      height={320}
                      className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.035] motion-reduce:transition-none"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center" aria-hidden="true">
                      <span className="text-4xl">🌿</span>
                    </div>
                  )}
                </div>
                <h3 className="mb-1 mt-4 font-serif text-[17px] font-medium leading-snug text-[#1A3831] md:text-lg">
                  {cat.name}
                </h3>
                <span className="text-xs text-[#6C7D65]">
                  Explore collection <span aria-hidden="true">↗</span>
                </span>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
};

export default CreativeCategories;

