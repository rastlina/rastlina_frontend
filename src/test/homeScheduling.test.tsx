import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import Home from '@/pages/Home';

vi.mock('@/components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('@/components/home/SocialProof', () => ({ default: () => null }));
vi.mock('@/components/home/HeroSection', () => ({
  default: ({ onReady }: { onReady: () => void }) => <button onClick={onReady}>Banner loaded</button>,
}));
vi.mock('@/components/home/HomeSections', () => ({ default: () => <section>Plant collections ready</section> }));

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

it('loads lower-page collections automatically after the banner paints', async () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
  render(<Home />);
  expect(screen.queryByText('Plant collections ready')).not.toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByText('Banner loaded'));
    await vi.dynamicImportSettled();
  });
  expect(screen.getByText('Plant collections ready')).toBeInTheDocument();
});

it('loads collections without scrolling even if the banner never finishes', async () => {
  vi.useFakeTimers();
  render(<Home />);
  await act(async () => {
    vi.advanceTimersByTime(3000);
    await vi.dynamicImportSettled();
  });
  expect(screen.getByText('Plant collections ready')).toBeInTheDocument();
});
