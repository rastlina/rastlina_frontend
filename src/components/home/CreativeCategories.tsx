// Category names, ordering, and destinations remain managed by the API.
import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import { ArrowRight } from 'lucide-react';

// Replace the approved poster set while allowing later dashboard uploads to win.
const botanicalImages: Record<string, { previous: string; image: string }> = {
  'air-purifying-plants': {
    previous: 'rastlina-spider-plant-arched-poster.webp',
    image: '/category-images/rastlina-air-purifying-plants-original-pot-v2.webp',
  },
  'best-sellers': {
    previous: 'rastlina-best-sellers-arched-poster.webp',
    image: '/category-images/rastlina-best-selling-plants-original-pot-v2.webp',
  },
  'exotic-beauties': {
    previous: 'rastlina-exotic-beauties-arched-poster.webp',
    image: '/category-images/rastlina-exotic-plants-original-pot-v2.webp',
  },
  'fast-grown': {
    previous: 'rastlina-fast-grown-arched-poster.webp',
    image: '/category-images/rastlina-fast-growing-plants-original-pot-v2.webp',
  },
  'favourite-collection': {
    previous: 'rastlina-favourite-collection-arched-poster.webp',
    image: '/category-images/rastlina-favourites-original-pot-v2.webp',
  },
};

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
  const categories = data.featured_categories.map((category) => {
    const replacement = botanicalImages[category.slug];
    const currentImage = category.image?.split(/[?#]/)[0];
    return replacement && (!currentImage || currentImage.endsWith(`/${replacement.previous}`))
      ? { ...category, image: replacement.image }
      : category;
  });

  return (
    <section className="home-categories bg-[#FBF8EF] py-8 md:py-10" aria-labelledby="category-heading">
      <div className="container-custom">
        <p className="home-section-label"><span aria-hidden="true">01</span> The collection</p>
        <div className="home-section-heading home-category-heading">
          <h2 id="category-heading" className="font-serif text-xl font-bold text-[#1A3831] md:text-2xl">
            Explore by Category
          </h2>
          <Link to="/shop?main_category=plants" className="home-view-all" aria-label="View All plants">
            View All <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <p className="category-swipe-hint md:hidden">Swipe to explore all 5 collections <span aria-hidden="true">→</span></p>
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

