import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Play } from 'lucide-react';
import { WatchAndShopVideo } from './WatchAndShopVideo';
import type { WatchAndShopItem } from '@/hooks/useWatchAndShop';

interface WatchAndShopCardProps {
  item: WatchAndShopItem;
  index?: number;
  active?: boolean;
  onActivate?: () => void;
}
export const WatchAndShopCard = memo(({ item, index = 0, active = true, onActivate }: WatchAndShopCardProps) => {
  const href = item.product_slug ? `/product/${encodeURIComponent(item.product_slug)}` : `/watch-shop/${encodeURIComponent(item.slug)}`;
  return <article className="watch-shop-card" data-active={active} onPointerEnter={event => { if (event.pointerType === 'mouse') onActivate?.(); }} onFocus={onActivate}>
    <div className="watch-shop-media">
      <WatchAndShopVideo videoUrl={item.video_url} thumbnail={item.thumbnail} productName={item.title}
        mode="card" autoplay={active} onRequestPlay={onActivate} />
      <Link to={href} className="watch-shop-media-link" aria-label={`Shop ${item.title}`} />
      <span className="watch-shop-film-label"><Play aria-hidden="true" size={11} /> In motion</span>
    </div>
    <Link to={href} className="watch-shop-copy" aria-label={`Watch & Shop: ${item.title}`}>
      <span className="watch-shop-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <h3>{item.title}</h3>
      <span className="watch-shop-cta">Meet this plant <ArrowUpRight aria-hidden="true" size={19} /></span>
    </Link>
  </article>;
});
WatchAndShopCard.displayName = 'WatchAndShopCard';
