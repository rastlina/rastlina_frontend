import { useEffect, useRef } from 'react';
import CreativeCategories from './CreativeCategories';
import BestSellers from './BestSellers';
import WatchAndShopSection from './WatchAndShopSection';
import Blogs from './Blogs';

export default function HomeSections() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !root.current) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.setAttribute('data-revealed', 'true');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.06 });
    root.current.querySelectorAll(':scope > section').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className="home-collections">
    <BestSellers />
    <nav className="home-shopping-help container-custom" aria-label="Plant shopping help">
      <a href="https://wa.me/918143814466?text=Hi%20Rastlina!%20Please%20help%20me%20choose%20an%20indoor%20plant." target="_blank" rel="noopener noreferrer">Need help choosing? Chat with us <span aria-hidden="true">↗</span></a>
    </nav>
    <CreativeCategories />
    <WatchAndShopSection />
    <Blogs />
  </div>;
}
