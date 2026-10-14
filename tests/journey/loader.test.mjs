import test from 'node:test';
import assert from 'node:assert/strict';
import { VideoScrubber } from '../../src/components/home/journey/controller.mjs';

class Video extends EventTarget {
  constructor() {
    super();
    Object.assign(this, { src: '', currentSrc: '', readyState: 0, duration: 10.041667, seeking: false, currentTime: 0 });
  }
  pause() {}
  load() { this.currentSrc = this.src; }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
}

test('default timers keep the Window receiver through loading, seeking, failure, retry and disposal', () => {
  const originalSet = globalThis.setTimeout;
  const originalClear = globalThis.clearTimeout;
  const timers = new Map();
  let next = 0;
  // Browser Window timers reject arbitrary receivers. Node timers do not,
  // which is why the old tests missed the published Illegal invocation.
  globalThis.setTimeout = function (callback) {
    assert.equal(this, globalThis, 'setTimeout must be called on Window');
    timers.set(++next, callback);
    return next;
  };
  globalThis.clearTimeout = function (id) {
    assert.equal(this, globalThis, 'clearTimeout must be called on Window');
    timers.delete(id);
  };
  try {
    const video = new Video();
    let errors = 0;
    const scrubber = new VideoScrubber(video, { onError: () => errors++ });
    scrubber.load('assets/nursery-v4.mp4');
    assert.ok(video.src.endsWith('/assets/nursery-v4.mp4'));
    assert.equal(timers.size, 1);
    video.readyState = 2;
    video.dispatchEvent(new Event('loadeddata'));
    assert.equal(scrubber.ready, true);
    assert.equal(timers.size, 0);
    scrubber.setProgress(0.5);
    assert.equal(video.currentTime, 5);
    video.seeking = true;
    [...timers.values()][0]();
    assert.equal(errors, 1);
    scrubber.load('assets/office-v4.mp4');
    video.dispatchEvent(new Event('loadeddata'));
    scrubber.dispose();
    assert.equal(timers.size, 0);
  } finally {
    globalThis.setTimeout = originalSet;
    globalThis.clearTimeout = originalClear;
  }
});

test('a synchronous media loader exception shows recovery and can be retried', () => {
  const video = new Video();
  let errors = 0;
  const timers = new Map();
  let next = 0;
  const scrubber = new VideoScrubber(video, {
    onError: () => errors++,
    setTimer: callback => { timers.set(++next, callback); return next; },
    clearTimer: id => timers.delete(id),
  });
  video.load = () => { throw new TypeError('Media load failed'); };
  assert.doesNotThrow(() => scrubber.load('assets/bedroom-v4.mp4'));
  assert.equal(errors, 1);
  assert.equal(scrubber.failed, true);
  assert.equal(timers.size, 0);
  video.load = Video.prototype.load;
  scrubber.load('assets/bedroom-v4.mp4');
  video.readyState = 2;
  video.dispatchEvent(new Event('loadeddata'));
  assert.equal(scrubber.ready, true);
  assert.equal(errors, 1);
});

test('missing media and stalled initial loads fail once and release their timers', () => {
  for (const reason of ['error', 'timeout']) {
    const video = new Video();
    const timers = new Map();
    let next = 0, errors = 0;
    const scrubber = new VideoScrubber(video, {
      onError: () => errors++,
      setTimer: callback => { timers.set(++next, callback); return next; },
      clearTimer: id => timers.delete(id),
    });
    scrubber.load('assets/missing.mp4');
    if (reason === 'error') video.dispatchEvent(new Event('error'));
    else [...timers.values()][0]();
    video.dispatchEvent(new Event('error'));
    assert.equal(errors, 1);
    assert.equal(scrubber.ready, false);
    assert.equal(timers.size, 0);
  }
});
