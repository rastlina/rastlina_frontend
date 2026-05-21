// src/components/home/GardenEssentials.tsx
// Static section — links to real main_category slugs from backend.
// Images are local assets (no API needed here).
// To make fully dynamic: replace items array with API categories.
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import officeImg from '@/assets/c1.jpeg';
import livingImg from '@/assets/c2.jpeg';
import balconyImg from '@/assets/c3.jpeg';

const items = [
  {
    title: 'Premium Planters',
    desc: 'Ceramic, Terracotta & Stands',
    image: balconyImg,
    link: '/shop?main_category=planters',
  },
  {
    title: 'Organic Seeds',
    desc: 'Vegetables, Flowers & Herbs',
    image: livingImg,
    link: '/shop?main_category=seeds',
  },
  {
    title: 'Plant Care',
    desc: 'Soils, Fertilizers & Tools',
    image: officeImg,
    link: '/shop?main_category=care',
  },
];

const GardenEssentials = () => (
  <section className="py-16 bg-white border-t border-gray-100">
    <div className="container-custom">
      <h2 className="text-2xl md:text-4xl font-serif font-bold text-center text-[#1A3831] mb-10 uppercase tracking-wide">
        Complete Your Garden
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="group relative h-[280px] md:h-[320px] overflow-hidden rounded-2xl shadow-md block"
          >
            <img
              src={item.image}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={item.title}
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
              <h3 className="text-2xl font-serif font-bold mb-2">{item.title}</h3>
              <p className="text-white/85 mb-5 font-light text-sm">{item.desc}</p>
              <Button className="bg-white text-[#1A3831] hover:bg-gray-100 border-none px-6 py-2 rounded-full text-sm font-bold">
                Shop Now
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default GardenEssentials;