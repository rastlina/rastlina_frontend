import { Star, Truck, Smile } from 'lucide-react';

const SocialProof = () => (
  <div className="bg-white border-b border-gray-100 py-4">
    <div className="container-custom">
      <div className="grid grid-cols-3 divide-x divide-gray-100 md:divide-x-0 md:flex md:justify-center md:gap-16 items-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center md:text-left px-1">
          <Smile className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-0" />
          <div className="flex flex-col md:block">
            <span className="font-bold text-xs md:text-sm text-gray-900 block md:inline">10k+</span>
            <span className="text-[10px] md:text-sm text-gray-500 md:text-gray-800 md:ml-1">Happy Homes</span>
          </div>
        </div>
        <div className="hidden md:block w-px h-8 bg-gray-200" />
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center md:text-left px-1">
          <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-0" />
          <div className="flex flex-col md:block">
            <span className="font-bold text-xs md:text-sm text-gray-900 block md:inline">Fast</span>
            <span className="text-[10px] md:text-sm text-gray-500 md:text-gray-800 md:ml-1">Safe Delivery</span>
          </div>
        </div>
        <div className="hidden md:block w-px h-8 bg-gray-200" />
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center md:text-left px-1">
          <div className="flex justify-center mb-1 md:mb-0">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 md:h-4 md:w-4 fill-accent-gold text-accent-gold" />)}
          </div>
          <div className="flex flex-col md:block">
            <span className="font-bold text-xs md:text-sm text-gray-900 block md:inline">4.8/5</span>
            <span className="text-[10px] md:text-sm text-gray-500 md:text-gray-800 md:ml-1">Reviews</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SocialProof;