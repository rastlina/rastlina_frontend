import { Link } from 'react-router-dom';

const SelfWateringSection = () => {
  return (
    <section className="py-16 bg-secondary-custom">
      <div className="container-custom px-4 md:px-0">
        <Link to="/shop?collection=self-watering" className="block relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
          <img 
            src="/self-watering-banner-optimized.webp"
            width={1400}
            height={764}
            alt="Rastlina Self-Watering Planters - How it works" 
            className="w-full h-auto object-cover"
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>
    </section>
  );
};

export default SelfWateringSection;
