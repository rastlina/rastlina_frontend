import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWatchAndShopList } from '@/hooks/useWatchAndShop';
import { WatchAndShopCard } from '@/components/watch-and-shop/WatchAndShopCard';

const WatchAndShopSection = () => {
  const { items, loading } = useWatchAndShopList();
  const rail = useRef<HTMLDivElement>(null);
  const pending = useRef<number | null>(null);
  const [active, setActive] = useState(0);

  const select = useCallback((index: number) => {
    const next = Math.max(0, Math.min(items.length - 1, index));
    setActive(next);
    const row = rail.current;
    const card = row?.children[next] as HTMLElement | undefined;
    if (row && card && row.scrollWidth > row.clientWidth) {
      row.scrollTo({ left: card.offsetLeft - (row.clientWidth - card.clientWidth) / 2,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [items.length]);

  const trackScroll = () => {
    if (pending.current !== null) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = null;
      const row = rail.current;
      if (!row || row.scrollWidth <= row.clientWidth) return;
      const centre = row.getBoundingClientRect().left + row.clientWidth / 2;
      let nearest = 0, distance = Infinity;
      [...row.children].forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const value = Math.abs(rect.left + rect.width / 2 - centre);
        if (value < distance) { nearest = index; distance = value; }
      });
      setActive(nearest);
    });
  };
  useEffect(() => () => { if (pending.current !== null) cancelAnimationFrame(pending.current); }, []);

  return (
    <section className="home-watch-shop" aria-labelledby="watch-shop-heading">
      <div className="container-custom">
        <div className="home-section-heading watch-shop-heading">
          <div>
            <p className="home-section-label"><span aria-hidden="true">03</span> The living edit</p>
            <h2 id="watch-shop-heading">Watch &amp; Shop</h2>
            <p className="home-section-note">See the plant. Find your favourite.</p>
          </div>
          <div className="watch-shop-navigation" aria-label="Browse plant videos">
            <button type="button" aria-label="Previous plant video" onClick={() => select(active - 1)} disabled={active === 0}><ChevronLeft aria-hidden="true" size={20} /></button>
            <button type="button" aria-label="Next plant video" onClick={() => select(active + 1)} disabled={active >= items.length - 1}><ChevronRight aria-hidden="true" size={20} /></button>
          </div>
        </div>
        <div ref={rail} className="watch-shop-rail" onScroll={trackScroll}>
          {loading
            ? Array.from({ length: 4 }, (_, index) => <div key={index} className="watch-shop-skeleton" aria-hidden="true" />)
            : items.map((item, index) => <WatchAndShopCard key={item.id} item={item} index={index}
                active={active === index} onActivate={() => setActive(index)} />)}
        </div>
        {!loading && items.length === 0 && <p className="watch-shop-empty">Find your next green companion. <Link to="/shop">Explore the collection ↗</Link></p>}
        {items.length > 0 && <div className="watch-shop-footer">
          <p>Real plants. A closer look.</p>
          <div className="watch-shop-pagination" aria-label="Choose a plant video">
            {items.map((item, index) => <button key={item.id} type="button" aria-label={`View ${item.title} video`}
              aria-pressed={active === index} onClick={() => select(index)}><span /></button>)}
          </div>
          <span className="watch-shop-count" aria-hidden="true">{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
        </div>}
      </div>
    </section>
  );
};
export default WatchAndShopSection;
