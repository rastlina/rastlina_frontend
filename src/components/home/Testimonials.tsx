import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Samriddhi G.",
      role: "Home Gardener",
      rating: 5,
      text: "Absolutely love the plant! It arrived healthy and brightens up my entire home.",
      image: "SG" 
    },
    {
      id: 2,
      name: "Rajiv D.",
      role: "Interior Designer",
      rating: 5,
      text: "Received a vibrant and well-packaged plant. It looks stunning in my living room.",
      image: "RD"
    },
    {
      id: 3,
      name: "Shridhar H.",
      role: "Plant Parent",
      rating: 5,
      text: "Amazing service! The plant arrived healthy and adds a lovely touch to my space.",
      image: "SH"
    }
  ];

  return (
    <section className="py-20 bg-secondary-custom/30">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-primary mb-4">Testimonials</h2>
          <div className="w-24 h-1 bg-accent-gold mx-auto rounded-full" />
        </div>

        <div className="flex overflow-x-auto snap-x gap-6 md:grid md:grid-cols-3 pb-6 md:pb-0 no-scrollbar px-4 md:px-0 -mx-4 md:mx-0">
          {reviews.map((review) => (
            <div key={review.id} className="min-w-[85%] md:min-w-0 snap-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative hover:-translate-y-1 transition-transform duration-300">
              <Quote className="absolute top-6 right-6 h-8 w-8 text-gray-100 fill-current" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-accent-earth/10 text-accent-earth rounded-full flex items-center justify-center font-bold text-lg">
                  {review.image}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-xs text-gray-500">{review.role}</p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent-gold text-accent-gold" />
                ))}
              </div>

              <p className="text-gray-600 text-sm leading-relaxed italic">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;