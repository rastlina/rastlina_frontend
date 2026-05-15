import { Star, Truck, Smile } from 'lucide-react';
import { useEffect, useState } from 'react';
import { contentService } from '@/services/api';

interface SocialProofItem {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  order: number;
  is_active: boolean;
}

interface HomeContentResponse {
  social_proof_items?: SocialProofItem[];
}

const DEFAULT_ITEMS: SocialProofItem[] = [
  {
    id: 1,
    icon: 'smile',
    title: '10k+',
    subtitle: 'Happy Homes',
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    icon: 'truck',
    title: 'Fast',
    subtitle: 'Safe Delivery',
    order: 2,
    is_active: true,
  },
  {
    id: 3,
    icon: 'star',
    title: '4.8/5',
    subtitle: 'Reviews',
    order: 3,
    is_active: true,
  },
];

const iconMap = {
  smile: Smile,
  truck: Truck,
  star: Star,
};

const SocialProof = () => {
  const [items, setItems] =
    useState<SocialProofItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data: HomeContentResponse =
          await contentService.getHomeContent();

        if (
          data?.social_proof_items &&
          data.social_proof_items.length > 0
        ) {
          setItems(data.social_proof_items);
        }

      } catch (error) {
        console.error('Social proof fetch failed:', error);

        // fallback remains automatically
        setItems(DEFAULT_ITEMS);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="bg-white border-b border-gray-100 py-4">
      <div className="container-custom">

        <div className="grid grid-cols-3 divide-x divide-gray-100 md:divide-x-0 md:flex md:justify-center md:gap-16 items-center">

          {items.map((item, index) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap];

            return (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-center md:text-left px-1"
              >
                {/* Special Star UI */}
                {item.icon === 'star' ? (
                  <div className="flex justify-center mb-1 md:mb-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 md:h-4 md:w-4 fill-accent-gold text-accent-gold"
                      />
                    ))}
                  </div>
                ) : (
                  Icon && (
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary mb-1 md:mb-0" />
                  )
                )}

                <div className="flex flex-col md:block">
                  <span className="font-bold text-xs md:text-sm text-gray-900 block md:inline">
                    {item.title}
                  </span>

                  <span className="text-[10px] md:text-sm text-gray-500 md:text-gray-800 md:ml-1">
                    {item.subtitle}
                  </span>
                </div>

                {/* Divider */}
                {index !== items.length - 1 && (
                  <div className="hidden md:block w-px h-8 bg-gray-200 ml-8" />
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default SocialProof;