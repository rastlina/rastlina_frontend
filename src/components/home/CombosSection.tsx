import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBundles } from '@/data/products';

const CombosSection = () => {
    const combos = getBundles().slice(0, 4);
    
    return (
        <section className="py-20 bg-white">
            <div className="container-custom">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-serif text-foreground">Combos & Bundles</h2>
                    <Link to="/shop?type=combo" className="text-primary font-medium hover:underline flex items-center gap-1">
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-12">
                    {combos.map((combo, i) => (
                        <div key={i} className="relative group cursor-pointer h-full">
                            <div className="absolute top-3 -right-3 w-full h-full border-2 border-primary/20 rounded-xl -z-10 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2 hidden md:block" />
                            
                            <Link to={`/product/${combo.slug}`} className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 h-full">
                                <div className="w-full sm:w-1/2 relative aspect-square sm:aspect-auto">
                                    <img src={combo.image} className="w-full h-full object-cover" alt={combo.name} />
                                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1 rounded-full shadow-sm">
                                      BUNDLE SAVE
                                    </div>
                                </div>
                                
                                <div className="w-full sm:w-1/2 p-4 md:p-6 flex flex-col justify-center">
                                    <h3 className="text-sm md:text-xl font-serif mb-1 md:mb-2 text-accent-earth group-hover:text-primary transition-colors">{combo.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-6 leading-relaxed line-clamp-2 md:line-clamp-3">{combo.description}</p>
                                    <div className="mt-auto">
                                      <div className="flex items-baseline gap-2 mb-2 md:mb-4">
                                        <span className="text-sm md:text-xl font-bold text-primary">₹{combo.price}</span>
                                        <span className="text-xs md:text-sm line-through text-gray-400">₹{combo.originalPrice}</span>
                                      </div>
                                      <Button className="w-full bg-primary hover:opacity-90 text-white h-8 md:h-10 text-xs md:text-sm">View Bundle</Button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CombosSection;