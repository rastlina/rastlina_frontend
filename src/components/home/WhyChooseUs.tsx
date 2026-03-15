import { Droplets, Palette, ShieldCheck, Leaf } from 'lucide-react';
import livingImg from '@/assets/category-living.jpg';

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-primary">Why Choose Rastlina?</h2>
        </div>

        <div className="w-full max-w-5xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-xl aspect-[21/9] relative bg-black/5">
           <video 
             src="/rastlina-animation.mp4" 
             className="w-full h-full object-cover"
             autoPlay
             muted
             loop
             playsInline
             poster={livingImg} 
           />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 md:p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-accent-earth">
                  <Droplets className="w-full h-full stroke-1" />
               </div>
               <h3 className="text-sm md:text-lg font-bold text-primary mb-1">Self Watering</h3>
               <p className="text-xs md:text-sm text-gray-600 hidden md:block">Designed for ease and elegance.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 md:p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-accent-earth">
                  <Palette className="w-full h-full stroke-1" />
               </div>
               <h3 className="text-sm md:text-lg font-bold text-primary mb-1">Aesthetic Designs</h3>
               <p className="text-xs md:text-sm text-gray-600 hidden md:block">Stylish planters to match interiors.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 md:p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-accent-earth">
                  <ShieldCheck className="w-full h-full stroke-1" />
               </div>
               <h3 className="text-sm md:text-lg font-bold text-primary mb-1">Innovative Care</h3>
               <p className="text-xs md:text-sm text-gray-600 hidden md:block">Expert tips and growing support.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 md:p-6 border border-gray-100 rounded-xl hover:shadow-lg transition-shadow bg-white">
               <div className="w-12 h-12 md:w-16 md:h-16 mb-3 text-accent-earth">
                  <Leaf className="w-full h-full stroke-1" />
               </div>
               <h3 className="text-sm md:text-lg font-bold text-primary mb-1">Healthy Plants</h3>
               <p className="text-xs md:text-sm text-gray-600 hidden md:block">Handpicked and nurtured.</p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;