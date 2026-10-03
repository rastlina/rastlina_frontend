import { afterEach, expect, it, vi } from 'vitest';
import { homeBootstrap } from '../../build/homeBootstrap.mjs';

afterEach(() => {
  document.dispatchEvent(new Event('rastlina:ready'));
  document.body.innerHTML = '';
  document.head.querySelectorAll('script, style').forEach(node => node.remove());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('starts the app and fonts automatically after the banner paint, only once', () => {
  vi.useFakeTimers();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
  document.body.innerHTML = '<img alt="Rastlina Banner" src="/banner.avif">';
  window.eval(homeBootstrap('/assets/test-entry.js', '@font-face{font-family:Test}'));
  expect(document.head.querySelector('script')).toBeNull();
  document.querySelector('img')!.dispatchEvent(new Event('load'));
  expect(document.head.querySelector('script')).toHaveAttribute('src', '/assets/test-entry.js');
  expect(document.head.querySelector('style')).toHaveTextContent('@font-face');
  vi.advanceTimersByTime(3000);
  expect(document.head.querySelectorAll('script')).toHaveLength(1);
});

it('starts urgently on early cart clicks and replays the click when hydration completes', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<img alt="Rastlina Banner" src="/banner.avif"><button aria-label="Open cart">Cart</button>';
  window.eval(homeBootstrap('/assets/test-entry.js', ''));
  const button = document.querySelector('button')!;
  const replay = vi.fn();
  button.addEventListener('click', replay);
  button.click();
  expect(document.head.querySelector('script')).toHaveAttribute('src', '/assets/test-entry.js');
  expect((document.head.querySelector('script') as HTMLScriptElement).fetchPriority).toBe('high');
  replay.mockClear();
  document.dispatchEvent(new Event('rastlina:ready'));
  expect(replay).toHaveBeenCalledTimes(1);
});

it('starts automatically even when the banner never loads', () => {
  vi.useFakeTimers();
  document.body.innerHTML = '<img alt="Rastlina Banner" src="/banner.avif">';
  window.eval(homeBootstrap('/assets/test-entry.js', ''));
  vi.advanceTimersByTime(3000);
  expect(document.head.querySelector('script')).toHaveAttribute('src', '/assets/test-entry.js');
});
