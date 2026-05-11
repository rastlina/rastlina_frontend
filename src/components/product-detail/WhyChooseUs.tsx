import { Droplets, Palette, ShieldCheck, Leaf } from 'lucide-react';

const benefits = [
  {
    icon: Droplets,
    title: "Self Watering",
    description: "Designed for ease and elegance."
  },
  {
    icon: Palette,
    title: "Aesthetic Designs",
    description: "Stylish planters to match interiors."
  },
  {
    icon: ShieldCheck,
    title: "Innovative Care",
    description: "Expert tips and growing support."
  },
  {
    icon: Leaf,
    title: "Healthy Plants",
    description: "Handpicked and nurtured."
  }
];

export const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-extrabold text-gray-900">
            Why Choose Rastlina?
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div 
              key={benefit.title} 
              className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors"
            >
              <benefit.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-extrabold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};