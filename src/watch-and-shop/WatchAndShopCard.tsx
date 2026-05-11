// src/components/watch-and-shop/WatchAndShopCard.tsx
// Single card for the Watch & Shop homepage section.
// Clicking anywhere navigates to /watch-shop/:slug
// Video autoplays when visible (handled by WatchAndShopVideo IntersectionObserver).

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { WatchAndShopVideo } from './WatchAndShopVideo';
import type { WatchAndShopItem } from '@/hooks/useWatchAndShop';

interface WatchAndShopCardProps {
  item: WatchAndShopItem;
  index?: number;
}

export const WatchAndShopCard = memo(({ item, index = 0 }: WatchAndShopCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.32) }}
      // Fixed width: creates the snap-scrolling effect
      className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] snap-start"
    >
      <Link
        to={`/watch-shop/${item.slug}`}
        className="block group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
        aria-label={`Watch & Shop: ${item.title}`}
      >
        {/* Video — fills the card in 9:16 portrait ratio */}
        <WatchAndShopVideo
          videoUrl={item.video_url}
          thumbnail={item.thumbnail}
          productName={item.title}
          mode="card"
        />

        {/* Gradient overlay — bottom to top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none rounded-2xl" />

        {/* "Watch & Shop" pill — top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1 pointer-events-none">
          <Play className="h-2.5 w-2.5 text-white fill-white" />
          <span className="text-[9px] font-bold text-white uppercase tracking-widest">
            Watch & Shop
          </span>
        </div>

        {/* Bottom content: title + CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <p className="text-white font-serif font-bold text-sm leading-snug line-clamp-2 mb-3 drop-shadow-sm">
            {item.title}
          </p>

          {/* Shop CTA — purely visual (the whole card is a link) */}
          <div className="flex items-center gap-1.5 bg-white text-[#1A3831] rounded-full px-3 py-1.5 w-fit text-[10px] font-extrabold uppercase tracking-widest shadow-sm group-hover:bg-[#1A3831] group-hover:text-white transition-colors duration-300">
            <ShoppingBag className="h-3 w-3" />
            Shop Now
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

WatchAndShopCard.displayName = 'WatchAndShopCard';