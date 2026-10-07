// Four supplied MP4 clips with verified catalogue destinations.
import { WatchAndShopCard } from '@/components/watch-and-shop/WatchAndShopCard';
import type { WatchAndShopItem } from '@/hooks/useWatchAndShop';

const items: WatchAndShopItem[] = [
  {
    "id": 46,
    "title": "Rex Begonia",
    "slug": "rex-begonia",
    "video_url": "/videos/watch-shop/rex-begonia.mp4",
    "thumbnail": "/videos/watch-shop/rex-begonia.jpg",
    "order": 0,
    "is_active": true,
    "product_slug": "rex-begonia"
  },
  {
    "id": 15,
    "title": "Calathea Ornata",
    "slug": "calathea-ornata",
    "video_url": "/videos/watch-shop/calathea-ornata.mp4",
    "thumbnail": "/videos/watch-shop/calathea-ornata.jpg",
    "order": 1,
    "is_active": true,
    "product_slug": "calathea-ornata"
  },
  {
    "id": 8,
    "title": "Aglaonema Suksom Jaipong",
    "slug": "aglaonema-suksom-jaipong",
    "video_url": "/videos/watch-shop/aglaonema-suksom-jaipong.mp4",
    "thumbnail": "/videos/watch-shop/aglaonema-suksom-jaipong.jpg",
    "order": 2,
    "is_active": true,
    "product_slug": "aglaonema-suksom-jaipong"
  },
  {
    "id": 42,
    "title": "Philodendron Moonshine",
    "slug": "philodendron-moonshine",
    "video_url": "/videos/watch-shop/philodendron-moonshine.mp4",
    "thumbnail": "/videos/watch-shop/philodendron-moonshine.jpg",
    "order": 3,
    "is_active": true,
    "product_slug": "philodendron-moonshine"
  }
];

const WatchAndShopSection = () => (
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
        {items.map((item, index) => (
          <WatchAndShopCard key={item.id} item={item} index={index} />
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-4 md:hidden">
        {items.map(item => <div key={item.id} className="w-1.5 h-1.5 rounded-full bg-white/30" />)}
      </div>
    </div>
  </section>
);

export default WatchAndShopSection;

