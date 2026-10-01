import { useLocation } from 'react-router-dom';
import { Seo } from './Seo';

const publicPages: Record<string, { title: string; description: string }> = {
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

  if (page) return <Seo {...page} path={pathname} />;

  if (privatePaths.has(pathname) || pathname.startsWith('/watch-shop/')) {
    return <Seo title="Rastlina" description="Rastlina online store." path={pathname} noIndex />;
  }

  return null;
}
