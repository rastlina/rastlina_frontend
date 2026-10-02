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
  render(<MemoryRouter><HeroSection /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  expect(banner).toHaveAttribute('src', '/first.webp');
  expect(banner).toHaveAttribute('loading', 'eager');
  expect(banner).toHaveAttribute('srcset', '/first-mobile.webp 768w, /first.webp 1600w');
  expect(banner.parentElement?.parentElement).not.toHaveAttribute('style');
});

it('does not rotate away from an image that has not finished loading', () => {
  vi.useFakeTimers();
  render(<MemoryRouter><HeroSection /></MemoryRouter>);
  const banner = screen.getByAltText('Rastlina Banner');
  act(() => { vi.advanceTimersByTime(30000); });
  expect(banner).toHaveAttribute('src', '/first.webp');
  fireEvent.load(banner);
  act(() => { vi.advanceTimersByTime(10000); });
  expect(banner).toHaveAttribute('src', '/second.webp');
  act(() => { vi.advanceTimersByTime(30000); });
  expect(banner).toHaveAttribute('src', '/second.webp');
});
