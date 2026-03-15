import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import officeImg from '@/assets/category-office.jpg';
import livingImg from '@/assets/category-living.jpg';
import balconyImg from '@/assets/category-balcony.jpg';

const GardenEssentials = () => (
  <section className="py-16 bg-white border-t border-gray-100">
    <div className="container-custom">
      <h2 className="text-3xl md:text-4xl font-serif text-center text-accent-earth mb-12 uppercase tracking-wide">
        Complete Your Garden
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Premium Planters', desc: 'Ceramic, Terracotta & Stands', image: balconyImg, link: '/shop?type=pots' },
            { title: 'Organic Seeds', desc: 'Vegetables, Flowers & Herbs', image: livingImg, link: '/shop?type=seeds' },
            { title: 'Plant Care', desc: 'Soils, Fertilizers & Tools', image: officeImg, link: '/shop?type=care' }
          ].map((item, i) => (
            <Link key={i} to={item.link} className="group relative h-[300px] overflow-hidden rounded-xl shadow-md block">
                <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.title} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
                    <h3 className="text-2xl font-serif mb-2">{item.title}</h3>
                    <p className="text-white/90 mb-6 font-light text-sm">{item.desc}</p>
                    <Button className="bg-white text-black hover:bg-gray-200 border-none px-6 py-2 rounded-full text-sm font-medium">
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