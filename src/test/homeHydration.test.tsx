import { act, fireEvent, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { StrictMode, type ReactNode } from 'react';
import { expect, it, vi } from 'vitest';
import App from '@/App';

const banner = { id: 1, image: 'https://api.rastlina.com/media/hero_slides/test.png', optimizedImage: '/test.webp', mobileImage: '/test-mobile.webp' };
vi.mock('virtual:rastlina-hero', () => ({ default: [{ id: 1, image: 'https://api.rastlina.com/media/hero_slides/test.png', optimizedImage: '/test.webp', mobileImage: '/test-mobile.webp' }] }));
vi.mock('@/services/api', () => ({
  storeService: {
    getNavbarData: async () => ({ main_categories: [], hero_slides: [] }),
    getSiteConfig: async () => null,
    getActiveCoupons: async () => [],
    getHomeData: async () => ({ hero_slides: [{ id: 1, image: 'https://api.rastlina.com/media/hero_slides/test.png' }] }),
  },
  contentService: { getHomeContent: async () => ({}) },
  authService: { getStoredUser: () => null, isLoggedIn: () => false },
}));

it('preserves the already-visible banner during hydration and activates menu/cart controls', async () => {
  vi.stubGlobal('scrollTo', vi.fn());
  const HomeRouter = ({ children }: { children: ReactNode }) => <StaticRouter location="/">{children}</StaticRouter>;
  const container = document.createElement('div');
  HelmetProvider.canUseDOM = false;
  container.innerHTML = renderToString(<StrictMode><HelmetProvider context={{}}><App Router={HomeRouter} /></HelmetProvider></StrictMode>);
  HelmetProvider.canUseDOM = true;
  document.body.appendChild(container);
  const firstImage = screen.getByAltText('Rastlina Banner');
  expect(firstImage).toHaveAttribute('src', banner.optimizedImage);
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  try {
    await act(async () => {
      root = hydrateRoot(container, <StrictMode><HelmetProvider><App /></HelmetProvider></StrictMode>, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(screen.getByAltText('Rastlina Banner')).toBe(firstImage);
    fireEvent.click(screen.getByRole('button', { name: 'Toggle menu' }));
    expect(screen.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getAllByRole('button', { name: 'Open cart' })[0]);
    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close cart' }));
    expect(screen.queryByText('Your Cart')).not.toBeInTheDocument();
  } finally {
    await act(async () => root!.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
