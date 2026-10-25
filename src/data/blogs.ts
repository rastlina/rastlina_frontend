import { vastuGuideContent } from './vastuGuide';
import { arrivalCareContent, deliveryGuideContent } from './visualJournal';

export const blogs = [
  {
    id: 1,
    title: 'Top 10 Vastu Plants for Your Home: The Rastlina Edit',
    excerpt: 'Ten Vastu-inspired plants from Rastlina’s current collection, with traditional placement ideas, practical care advice and direct links to each plant.',
    image: '/optimized/blog-vastu-v2.webp',
    imageAlt: 'A selection of Rastlina plants in original ivory self-watering pots in a sunlit home',
    date: 'Oct 12, 2025', publishedDate: '2025-10-12', modifiedDate: '2026-10-24', tag: 'Vastu & Living',
    content: vastuGuideContent,
  },
  {
    id: 2,
    title: 'Your Plant Is Home. Here’s What to Do Next.',
    excerpt: 'A gentle start for your new plant: unbox carefully, check the soil, find its light and settle into the first two weeks.',
    image: '/optimized/journal-arrival-unbox.webp',
    imageAlt: 'Gently unboxing a healthy plant in its original branded Rastlina pot',
    date: 'Updated Oct 25, 2026', publishedDate: '2025-09-28', modifiedDate: '2026-10-25', tag: 'Arrival Care',
    content: arrivalCareContent,
  },
  {
    id: 3,
    title: 'PAN-India Plant Delivery, Packed with Care.',
    excerpt: 'Your guide to PAN-India plant delivery, safe packaging, arrival timing and a thoughtful welcome for every green gift.',
    image: '/optimized/journal-delivery-hero.webp',
    imageAlt: 'A healthy plant protected in a delivery carton with its original Rastlina pot',
    date: 'Updated Oct 25, 2026', publishedDate: '2025-09-15', modifiedDate: '2026-10-25', tag: 'Delivery & Gifting',
    content: deliveryGuideContent,
  },
];
