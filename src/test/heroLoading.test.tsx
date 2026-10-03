import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import HeroSection from '@/components/home/HeroSection';

vi.mock('@/hooks/useHomeData', () => ({
  useHomeData: () => ({ loading: true, data: { hero_slides: [] } }),
}));
vi.mock('virtual:rastlina-hero', () => ({ default: [
  { id: 1, image: 'https://api.rastlina.com/media/hero_slides/first.png', optimizedImage: '/first.webp', mobileImage: '/first-mobile.webp', optimizedAvif: '/first.avif', mobileAvif: '/first-mobile.avif' },
  { id: 2, image: 'https://api.rastlina.com/media/hero_slides/second.png', optimizedImage: '/second.webp', mobileImage: '/second-mobile.webp' },
] }));

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

it('shows an eager responsive banner while catalogue data is pending', () => {
  const onReady = vi.fn();
  render(<MemoryRouter><HeroSection onReady={onReady} /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  expect(banner).toHaveAttribute('src', '/first.webp');
  expect(banner).toHaveAttribute('loading', 'eager');
  expect(banner).toHaveClass('h-auto');
  expect(banner).not.toHaveClass('object-cover');
  expect(banner).toHaveAttribute('srcset', '/first-mobile.webp 768w, /first.webp 1600w');
  expect(banner.parentElement?.querySelector('source')).toHaveAttribute('srcset', '/first-mobile.avif 768w, /first.avif 1600w');
  expect(banner.parentElement?.parentElement).not.toHaveAttribute('style');
  fireEvent.load(banner);
  expect(onReady).toHaveBeenCalledTimes(1);
});

it('falls back from AVIF to WebP before using the original image', () => {
  render(<MemoryRouter><HeroSection /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  fireEvent.error(banner);
  expect(banner.parentElement?.querySelector('source')).not.toHaveAttribute('srcset');
  expect(banner).toHaveAttribute('src', '/first.webp');
  fireEvent.error(banner);
  expect(banner).not.toHaveAttribute('srcset');
  expect(banner).toHaveAttribute('src', 'https://api.rastlina.com/media/hero_slides/first.png');
});

it('recovers an image error that happened before hydration attached its handlers', () => {
  vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
  vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);
  render(<MemoryRouter><HeroSection /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  expect(banner.parentElement?.querySelector('source')).not.toHaveAttribute('srcset');
  expect(banner).toHaveAttribute('src', '/first.webp');
});

it('keeps one stable banner even when more banners exist in the catalogue', () => {
  vi.useFakeTimers();
  render(<MemoryRouter><HeroSection /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  act(() => { vi.advanceTimersByTime(30000); });
  expect(banner).toHaveAttribute('src', '/first.webp');
  fireEvent.load(banner);
  act(() => { vi.advanceTimersByTime(60000); });
  expect(banner).toHaveAttribute('src', '/first.webp');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
