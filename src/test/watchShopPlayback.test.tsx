import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WatchAndShopVideo } from '@/components/watch-and-shop/WatchAndShopVideo';
import WatchAndShopSection from '@/components/home/WatchAndShopSection';

vi.mock('@/hooks/useWatchAndShop', () => ({ useWatchAndShopList: () => ({ loading: false,
  items: ['Rex Begonia', 'Calathea Ornata', 'Aglaonema', 'Moonshine'].map((title, index) => ({
    id: index, title, slug: `plant-${index}`, video_url: `https://example.test/${index}.mp4`, thumbnail: `https://example.test/${index}.jpg`, product_slug: `plant-${index}`,
  })),
}) }));

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) { this.callback([{ target, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    unobserve() {} disconnect() {}
  });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: false });
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: true });
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('loads and plays only the selected reel, with direct product links for every card', async () => {
  const { container } = render(<MemoryRouter><WatchAndShopSection /></MemoryRouter>);
  await waitFor(() => expect(container.querySelectorAll('video[src]')).toHaveLength(1));
  expect(container.querySelector('video[src]')).toHaveAttribute('src', 'https://example.test/0.mp4');
  fireEvent.click(screen.getByRole('button', { name: 'Next plant video' }));
  await waitFor(() => expect(container.querySelector('[data-active="true"] video')).toHaveAttribute('src', 'https://example.test/1.mp4'));
  expect(container.querySelectorAll('video[autoplay]')).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'Watch & Shop: Calathea Ornata' })).toHaveAttribute('href', '/product/plant-1');
  expect(container.querySelector('a button')).toBeNull();
});
it('offers pause and play without following the product link', async () => {
  const { container } = render(<WatchAndShopVideo videoUrl="https://example.test/plant.mp4" productName="Jade" />);
  const video = container.querySelector('video')!;
  await waitFor(() => expect(video).toHaveAttribute('src'));
  fireEvent.playing(video);
  fireEvent.click(screen.getByRole('button', { name: 'Pause Jade video' }));
  expect(video.paused).toBe(true);
  const plays = vi.mocked(video.play).mock.calls.length;
  fireEvent.click(screen.getByRole('button', { name: 'Play Jade video' }));
  await waitFor(() => expect(vi.mocked(video.play).mock.calls.length).toBeGreaterThan(plays));
});
it('suspends playback when the page is hidden', async () => {
  const { container } = render(<WatchAndShopVideo videoUrl="https://example.test/plant.mp4" productName="Jade" />);
  const video = container.querySelector('video')!;
  await waitFor(() => expect(video).toHaveAttribute('src'));
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  fireEvent(document, new Event('visibilitychange'));
  await waitFor(() => expect(video.paused).toBe(true));
});
it('retains the poster and exposes a retry control on media error', async () => {
  const { container } = render(<WatchAndShopVideo videoUrl="https://example.test/plant.mp4" thumbnail="https://example.test/plant.jpg" productName="Jade" />);
  const video = container.querySelector('video')!;
  await waitFor(() => expect(video).toHaveAttribute('src'));
  fireEvent.error(video);
  expect(screen.getByAltText('Jade')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Retry Jade video' })).toBeInTheDocument();
});
