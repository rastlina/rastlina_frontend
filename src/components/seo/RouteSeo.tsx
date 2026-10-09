import { useLocation } from 'react-router-dom';
import { Seo } from './Seo';

// eslint-disable-next-line react-refresh/only-export-components -- Shared metadata is also read by the prerender build.
export const publicPages: Record<string, { title: string; description: string }> = {
  '/shop': {
    title: 'All Products | Buy Indoor Plants Online | Rastlina',
    description: 'Browse all products at Rastlina. Shop ready-to-gift indoor plants with a self-watering pot and soil mix, delivered across India.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Rastlina',
    description: 'Read the privacy policy for Rastlina Nature Hub Private Limited.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions | Rastlina',
    description: 'Read Rastlina’s terms and conditions for online purchases.',
  },
  '/shipping-policy': {
    title: 'Shipping Policy | Rastlina',
    description: 'Review delivery and shipping information for Rastlina indoor plant orders.',
  },
  '/returns-refund-policy': {
    title: 'Returns & Refund Policy | Rastlina',
    description: 'Review Rastlina’s returns and refund policy for indoor plant orders.',
  },
  '/replacement-policy': {
    title: 'Replacement Policy | Rastlina',
    description: 'Review the replacement policy for Rastlina indoor plant orders.',
  },
  '/bulk': {
    title: 'Bulk & Corporate Indoor Plant Gifts | Rastlina',
    description: 'Order ready-to-gift indoor plants in bulk for corporate gifting, events and special occasions.',
  },
};

const privatePaths = new Set(['/login', '/profile', '/checkout']);

export function RouteSeo() {
  const { pathname } = useLocation();
  const page = publicPages[pathname];

  // Shop owns its filtered metadata after the application starts.
  if (page && pathname !== '/shop') return <Seo {...page} path={pathname} />;

  if (privatePaths.has(pathname) || pathname.startsWith('/watch-shop/')) {
    return <Seo title="Rastlina" description="Rastlina online store." path={pathname} noIndex />;
  }

  return null;
}
