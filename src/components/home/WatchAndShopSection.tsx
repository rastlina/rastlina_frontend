// MP4 cards are now managed through the backend Watch & Shop admin.
import { useWatchAndShopList } from '@/hooks/useWatchAndShop';
import { WatchAndShopCard } from '@/components/watch-and-shop/WatchAndShopCard';

const WatchAndShopSection = () => {
  const { items, loading } = useWatchAndShopList();
  if (!loading && items.length === 0) return null;

  return (
    <section className="py-12 bg-[#0F1E17]">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-7 px-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Watch & Shop</h2>
            <p className="text-[#667D00] text-sm font-medium mt-0.5">See it in action — then get it</p>
          </div>
        </div>
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scroll-smooth md:justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] snap-start">
                  <div className="aspect-[9/16] rounded-2xl bg-white/10 animate-pulse" />
                </div>
              ))
            : items.map((item, index) => (
                <WatchAndShopCard key={item.id} item={item} index={index} />
              ))}
        </div>
        {!loading && items.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 md:hidden">
            {items.map(item => <div key={item.id} className="w-1.5 h-1.5 rounded-full bg-white/30" />)}
          </div>
        )}
      </div>
    </section>
  );
};

export default WatchAndShopSection;

