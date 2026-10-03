import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import HeroSection from '@/components/home/HeroSection';

vi.mock('@/hooks/useHomeData', () => ({
  useHomeData: () => ({ loading: true, data: { hero_slides: [] } }),
}));
vi.mock('virtual:rastlina-hero', () => ({ default: [
  { id: 1, image: 'https://api.rastlina.com/media/hero_slides/first.png', optimizedImage: '/first.webp', mobileImage: '/first-mobile.webp' },
  { id: 2, image: 'https://api.rastlina.com/media/hero_slides/second.png', optimizedImage: '/second.webp', mobileImage: '/second-mobile.webp' },
] }));

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('shows an eager responsive banner while catalogue data is pending', () => {
  const onReady = vi.fn();
  render(<MemoryRouter><HeroSection onReady={onReady} /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  expect(banner).toHaveAttribute('src', '/first.webp');
  expect(banner).toHaveAttribute('loading', 'eager');
  expect(banner).toHaveClass('h-auto');
  expect(banner).not.toHaveClass('object-cover');
  expect(banner).toHaveAttribute('srcset', '/first-mobile.webp 768w, /first.webp 1600w');
  expect(banner.parentElement?.parentElement).not.toHaveAttribute('style');
  fireEvent.load(banner);
  expect(onReady).toHaveBeenCalledTimes(1);
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
