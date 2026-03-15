import { Play } from 'lucide-react';

import heroImage from '@/assets/hero-living-room.jpg';
import officeImg from '@/assets/category-office.jpg';
import livingImg from '@/assets/category-living.jpg';
import balconyImg from '@/assets/category-balcony.jpg';

const WatchAndBuy = () => (
  <section className="py-16 bg-primary text-white">
    <div className="container-custom">
      <div className="flex justify-between items-end mb-8">
        <div>
            <h2 className="text-3xl md:text-4xl font-serif flex items-center gap-2">
                <Play className="fill-white h-6 w-6" /> Watch & Shop
            </h2>
            <p className="text-white/80 text-sm mt-2">See them in action. Click to buy.</p>
        </div>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 md:pb-0 no-scrollbar snap-x px-4 md:px-0 -mx-4 md:mx-0">
        {[livingImg, officeImg, balconyImg, heroImage].map((img, i) => (
            <div key={i} className="min-w-[200px] md:min-w-0 snap-center aspect-[9/16] relative bg-black/20 rounded-xl overflow-hidden group cursor-pointer border border-white/10">
                <img src={img} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Video thumb" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <Play className="fill-white text-white h-5 w-5 ml-1" />
                    </div>
                </div>
                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Featured</p>
                    <p className="text-[10px] text-white/90">Tap to Shop</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  </section>
);

export default WatchAndBuy;