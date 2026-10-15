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
    <CreativeCategories />
    <WatchAndShopSection />
    <BestSellers />
    <Blogs />
  </div>;
}
