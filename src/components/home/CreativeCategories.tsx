import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import heroImage from '@/assets/hero-living-room.jpg';
import bedroomImg from '@/assets/category-bedroom.jpg';
import officeImg from '@/assets/category-office.jpg';
import livingImg from '@/assets/category-living.jpg';
import balconyImg from '@/assets/category-balcony.jpg';

const CreativeCategories = () => {
  const categories = [
    { label: 'Indoor', image: bedroomImg, href: '/shop?cat=indoor' },
    { label: 'Air Purifying', image: livingImg, href: '/shop?cat=air-purifying' },
    { label: 'Flowering', image: balconyImg, href: '/shop?cat=flowering' },
    { label: 'Pet Safe', image: officeImg, href: '/shop?cat=pet-friendly' },
    { label: 'Low Light', image: heroImage, href: '/shop?cat=low-light' },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6 px-2">
           <h2 className="text-xl md:text-2xl font-serif text-primary">Explore by Category</h2>
           <Link to="/shop" className="text-sm font-medium text-accent-earth hover:text-primary flex items-center gap-1">
             View All <ChevronRight className="h-4 w-4" />
           </Link>
        </div>
        <div className="flex flex-nowrap justify-start md:justify-center overflow-x-auto gap-4 md:gap-12 pb-4 no-scrollbar px-4 snap-x">
          {categories.map((cat, i) => (
            <Link key={i} to={cat.href} className="group flex flex-col items-center gap-2 flex-shrink-0 snap-start">
              <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden border border-gray-100 group-hover:border-accent-gold transition-all duration-300 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                   <img src={cat.image} alt={cat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </div>
              <span className="text-[10px] md:text-sm font-medium text-gray-700 group-hover:text-primary transition-colors text-center w-16 md:w-auto leading-tight">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CreativeCategories;