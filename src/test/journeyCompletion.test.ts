import { afterEach, expect, it, vi } from 'vitest';
import markup from '@/components/home/journey/markup.html?raw';
import { mountJourney } from '@/components/home/journey/controller.mjs';

let dispose: (() => void) | undefined;
afterEach(() => {
  dispose?.(); dispose = undefined;
  document.body.innerHTML = '';
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
});

it('shows the three space choices only after all five films and opens the chosen room', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: false }));
  vi.stubGlobal('ResizeObserver', undefined);
  vi.stubGlobal('scrollTo', vi.fn());
  const states = new WeakMap<HTMLMediaElement, { paused: boolean; time: number; ready: number }>();
  const state = (video: HTMLMediaElement) => {
    if (!states.has(video)) states.set(video, { paused: true, time: 0, ready: 0 });
    return states.get(video)!;
  };
  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function () { return state(this).paused; });
  vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockImplementation(function () { return state(this).ready; });
  vi.spyOn(HTMLMediaElement.prototype, 'duration', 'get').mockReturnValue(2);
  vi.spyOn(HTMLMediaElement.prototype, 'currentTime', 'get').mockImplementation(function () { return state(this).time; });
  vi.spyOn(HTMLMediaElement.prototype, 'currentTime', 'set').mockImplementation(function (value) { state(this).time = value; });
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(function () { Object.assign(state(this), { ready: 0, time: 0, paused: true }); });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function () { state(this).paused = true; });
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function () {
    state(this).paused = false;
    this.dispatchEvent(new Event('play'));
    queueMicrotask(() => {
      state(this).ready = 4;
      this.dispatchEvent(new Event('loadedmetadata'));
      this.dispatchEvent(new Event('loadeddata'));
    });
    return Promise.resolve();
  });
  const root = document.createElement('div');
  root.className = 'plant-journey'; root.innerHTML = markup; document.body.append(root);
  const intro = root.querySelector<HTMLElement>('#nursery-story')!;
  Object.defineProperty(intro, 'offsetHeight', { value: 700 });
  const dialog = root.querySelector<HTMLDialogElement>('#space-prompt')!;
  dialog.showModal = vi.fn(() => { dialog.open = true; });
  dialog.close = vi.fn(() => { dialog.open = false; dialog.dispatchEvent(new Event('close')); });
  dispose = mountJourney(root, { assetBase: '/journey/assets' });
  await vi.advanceTimersByTimeAsync(100);
  expect(root.querySelector('.reading-progress')).toBeNull();
  const videos = [...root.querySelectorAll<HTMLVideoElement>('#nursery-window video')];
  for (const video of videos) {
    expect(dialog.hidden).toBe(true);
    expect(video.paused).toBe(false);
    video.currentTime = 2;
    video.dispatchEvent(new Event('timeupdate'));
    state(video).paused = true;
    video.dispatchEvent(new Event('ended'));
    await vi.advanceTimersByTimeAsync(1200);
  }
  expect(dialog.hidden).toBe(false);
  expect(dialog.showModal).toHaveBeenCalledTimes(1);
  expect(dialog.querySelectorAll('.space-option')).toHaveLength(3);
  dialog.querySelector<HTMLButtonElement>('[data-room="office"]')!.click();
  await vi.advanceTimersByTimeAsync(50);
  expect(dialog.hidden).toBe(true);
  expect(root.querySelector<HTMLElement>('#room-story')!.hidden).toBe(false);
  expect(root.querySelector<HTMLVideoElement>('#room-video')!.src).toContain('office-v4.mp4');
});
