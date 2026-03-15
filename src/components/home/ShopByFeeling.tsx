import { Link } from 'react-router-dom';

import bedroomImg from '@/assets/category-bedroom.jpg';
import officeImg from '@/assets/category-office.jpg';
import livingImg from '@/assets/category-living.jpg';
import balconyImg from '@/assets/category-balcony.jpg';

const ShopByFeeling = () => {
  const collections = [
    { label: 'Sleep Better', desc: 'Elevate your rest', image: bedroomImg, href: '/shop?collection=sleep' },
    { label: 'Focus More', desc: 'Boost productivity', image: officeImg, href: '/shop?collection=work' },
    { label: 'Breathe Easy', desc: 'Pure air plants', image: livingImg, href: '/shop?collection=air' },
    { label: 'Attract Luck', desc: 'Vastu vibes', image: balconyImg, href: '/shop?collection=vastu' },
  ];

  return (
    <section className="py-12 bg-secondary-custom">
      <div className="container-custom">
        <h2 className="text-3xl font-serif text-center text-accent-earth mb-3">Curate Your Atmosphere</h2>
        <p className="text-center text-gray-500 mb-8">Plants selected for specific moods</p>
        <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 md:gap-6 md:pb-0 no-scrollbar snap-x px-4 md:px-0 -mx-4 md:mx-0">
          {collections.map((col, i) => (
            <Link key={i} to={col.href} className="min-w-[260px] md:min-w-0 snap-center group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 shadow-md">
              <img src={col.image} alt={col.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 w-full p-5 text-white">
                <h3 className="text-xl font-serif mb-1">{col.label}</h3>
                <p className="text-xs text-white/80 mb-3">{col.desc}</p>
                <span className="text-xs uppercase tracking-widest font-bold border-b border-white pb-1">Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByFeeling;