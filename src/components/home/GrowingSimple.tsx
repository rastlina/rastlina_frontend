import { Truck, Sprout } from 'lucide-react';

const GrowingSimple = () => (
    <section className="py-12 bg-white border-t border-gray-100">
        <div className="container-custom">
            <h2 className="text-2xl font-serif text-center mb-8 text-primary">Growing Together is Simple</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="font-bold text-sm text-accent-earth">Pick</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[120px]">Choose your perfect plant match</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm text-accent-earth">Receive</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[120px]">Safe delivery to your doorstep</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-sm text-accent-earth">Grow</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-[120px]">Watch it thrive with our tips</p>
                </div>
            </div>
        </div>
    </section>
);

export default GrowingSimple;