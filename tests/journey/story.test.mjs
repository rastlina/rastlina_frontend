import test from 'node:test';
import assert from 'node:assert/strict';
import { clampProgress, sectionProgress, cinematicProgress, nurseryProgress, sceneDepth, choiceDepth, finalFrameTime, roomSelection, VideoScrubber } from '../../src/components/home/journey/controller.mjs';

class Video extends EventTarget {
  constructor() {
    super();
    Object.assign(this, { src: '', currentSrc: '', readyState: 0, duration: NaN, seeking: false, time: 0, seeks: [], loads: [], pauses: 0 });
  }
  get currentTime() { return this.time; }
  set currentTime(value) {
    if (this.rejectSeek) throw new Error('Not ready');
    this.time = value;
    this.seeks.push(value);
    this.seeking = true;
  }
  pause() { this.pauses++; }
  load() {
    this.loads.push(this.src);
    this.currentSrc = '';
    this.readyState = 0;
    this.seeking = false;
    this.time = 0;
  }
  metadata(duration = 10.041667) {
    this.currentSrc = this.src;
    this.duration = duration;
    this.readyState = 1;
    this.dispatchEvent(new Event('loadedmetadata'));
  }
  data() { this.readyState = 2; this.dispatchEvent(new Event('loadeddata')); }
  completeSeek() { this.seeking = false; this.dispatchEvent(new Event('seeked')); }
}

test('scroll distance reaches the endpoints and reverses without overshooting', () => {
  assert.equal(sectionProgress(10, 2880, 800), 0);
  assert.equal(sectionProgress(-1040, 2880, 800), 0.5);
  assert.equal(sectionProgress(-2080, 2880, 800), 1);
  assert.equal(sectionProgress(-3000, 2880, 800), 1);
  assert.equal(sectionProgress(-520, 2880, 800), 0.25);
  assert.equal(clampProgress(NaN), 0);
  assert.equal(clampProgress(Infinity), 0);
});

test('endpoints use the last decodable frame rather than the duration boundary', () => {
  assert.equal(finalFrameTime(5.041667), 5);
  assert.equal(finalFrameTime(10.041667), 10);
  assert.equal(finalFrameTime(0), 0);
  assert.equal(finalFrameTime(NaN), 0);
});

test('all room choices point to their own video and poster', () => {
  for (const id of ['living-room', 'bedroom', 'office']) {
    const selected = roomSelection(id);
    assert.equal(selected.video, `assets/${id}-v4.mp4`);
    assert.equal(selected.poster, `assets/${id}-start.webp`);
    assert.ok(selected.name);
  }
  for (const invalid of ['nursery', '__proto__', 'constructor', '']) assert.throws(() => roomSelection(invalid));
});

test('a scroll position requested before metadata is applied when media becomes ready', () => {
  const video = new Video();
  let ready = 0;
  const scrubber = new VideoScrubber(video, { onReady: () => ready++ });
  scrubber.load('assets/living-room.mp4');
  scrubber.setProgress(0.5);
  assert.deepEqual(video.seeks, []);
  video.metadata();
  assert.equal(video.currentTime, 5);
  video.data();
  video.completeSeek();
  assert.equal(ready, 1);
  assert.equal(video.muted, true);
  assert.equal(video.playsInline, true);
});

test('cinematic pacing holds both endpoints and remains reversible', () => {
  assert.equal(cinematicProgress(0.01), 0);
  assert.equal(cinematicProgress(0.02), 0);
  assert.equal(cinematicProgress(0.84), 1);
  assert.equal(cinematicProgress(1), 1);
  assert.ok(Math.abs(cinematicProgress(0.43) - 0.5) < 1e-10);
  assert.ok(cinematicProgress(0.7) > cinematicProgress(0.3));
  assert.equal(cinematicProgress(NaN), 0);
});

test('the nursery finishes before the overlapping choices first enter', () => {
  // At 350vh scene height and a 100vh overlap, cards start entering at 60%.
  assert.equal(nurseryProgress(0.02), 0);
  assert.equal(nurseryProgress(0.59), 1);
  assert.equal(nurseryProgress(0.6), 1);
  assert.equal(nurseryProgress(1), 1);
  assert.ok(Math.abs(nurseryProgress(0.3) - 0.5) < 1e-10);
});

test('copy recedes in depth while the film remains stationary during its camera travel', () => {
  const beginning = sceneDepth(0, 0);
  assert.equal(beginning.copyOpacity, 1);
  for (const key of ['copyY', 'copyZ', 'sceneZ', 'ambienceY']) assert.equal(Math.abs(beginning[key]), 0);
  const halfway = sceneDepth(0.5, 0.5);
  assert.equal(halfway.copyOpacity, 0);
  assert.equal(halfway.copyZ, -180);
  assert.equal(Math.abs(halfway.sceneZ), 0);
  assert.equal(Math.abs(sceneDepth(1, 0.59, true).sceneZ), 0);
  assert.ok(sceneDepth(1, 0.8, true).sceneZ < 0);
  assert.equal(sceneDepth(1, 1, true).sceneZ, -96);
  assert.equal(Math.abs(sceneDepth(1, 0.9, false).sceneZ), 0);
});

test('room cards settle into a readable plane and reverse consistently', () => {
  for (const index of [0, 1, 2]) {
    const entering = choiceDepth(800, 1000, index);
    assert.ok(entering.y > 0 && entering.y <= 72);
    assert.ok(entering.z < 0 && entering.z >= -96);
    assert.ok(entering.opacity >= 0.6 && entering.opacity <= 1);
    const settled = choiceDepth(0, 1000, index);
    for (const key of ['y', 'z', 'turn']) assert.equal(Math.abs(settled[key]), 0);
    assert.equal(settled.opacity, 1);
    assert.deepEqual(choiceDepth(800, 1000, index), entering);
  }
});

test('manual mode removes all depth motion while keeping headings and cards readable', () => {
  assert.deepEqual(sceneDepth(1, 1, true, true), { copyOpacity: 1, copyY: 0, copyZ: 0, sceneZ: 0, ambienceY: 0 });
  assert.deepEqual(choiceDepth(900, 1000, 2, true), { y: 0, z: 0, turn: 0, opacity: 1 });
});
test('reduced motion clears the heading without moving any scene elements', () => {
  assert.deepEqual(sceneDepth(1, 1, true, false, true), { copyOpacity: 0, copyY: 0, copyZ: 0, sceneZ: 0, ambienceY: 0 });
  assert.equal(sceneDepth(0, 0, false, false, true).copyOpacity, 1);
});

test('ready and completion callbacks wait for the requested frame to finish seeking', () => {
  const video = new Video();
  let ready = 0;
  const frames = [];
  const scrubber = new VideoScrubber(video, { onReady: () => ready++, onFrame: value => frames.push(value) });
  scrubber.load('assets/office.mp4');
  scrubber.setProgress(1);
  video.metadata();
  video.data();
  assert.equal(ready, 0);
  assert.deepEqual(frames, []);
  video.completeSeek();
  assert.equal(ready, 1);
  assert.deepEqual(frames, [1]);
  video.dispatchEvent(new Event('canplay'));
  assert.equal(ready, 1);
  scrubber.setProgress(0.5);
  video.completeSeek();
  assert.equal(frames.at(-1), 0.5);
});

test('canplay recovers a decoded image when loadeddata was not delivered', () => {
  const video = new Video();
  let ready = 0;
  const scrubber = new VideoScrubber(video, { onReady: () => ready++ });
  scrubber.load('assets/bedroom.mp4');
  video.metadata();
  video.readyState = 3;
  video.dispatchEvent(new Event('canplay'));
  assert.equal(ready, 1);
});

test('a stalled initial load offers one retry, and late old events cannot clear its error', () => {
  const timers = new Map();
  let nextTimer = 0;
  const video = new Video();
  let errors = 0;
  let ready = 0;
  const scrubber = new VideoScrubber(video, {
    onError: () => errors++, onReady: () => ready++,
    setTimer: callback => { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimer: id => timers.delete(id),
  });
  scrubber.load('assets/office.mp4');
  const timedOut = timers.get(nextTimer);
  timedOut();
  timedOut();
  assert.equal(errors, 1);
  video.metadata();
  video.data();
  assert.equal(ready, 0);
  scrubber.load('assets/office.mp4');
  scrubber.setProgress(0.6);
  video.metadata();
  video.data();
  video.completeSeek();
  assert.equal(video.currentTime, 6);
  assert.equal(ready, 1);
  assert.equal(timers.size, 0);
});

test('rapid scrolling waits for the pending seek and catches the latest position', () => {
  const video = new Video();
  const scrubber = new VideoScrubber(video);
  scrubber.load('assets/office.mp4');
  video.metadata();
  video.data();
  scrubber.setProgress(0.5);
  scrubber.setProgress(0.9);
  scrubber.setProgress(0.2);
  scrubber.setProgress(1);
  assert.deepEqual(video.seeks, [5]);
  video.completeSeek();
  assert.deepEqual(video.seeks, [5, 10]);
  video.completeSeek();
  scrubber.setProgress(0);
  assert.equal(video.currentTime, 0);
  assert.deepEqual(video.seeks, [5, 10, 0]);
});

test('room switching resets the position and ignores events from the previous source', () => {
  const video = new Video();
  let ready = 0;
  let errors = 0;
  const scrubber = new VideoScrubber(video, { onReady: () => ready++, onError: () => errors++ });
  scrubber.load('assets/living-room.mp4');
  video.metadata();
  video.data();
  const previous = video.currentSrc;
  scrubber.setProgress(1);
  scrubber.load('assets/bedroom.mp4');
  assert.equal(scrubber.progress, 0);
  assert.equal(scrubber.ready, false);
  video.currentSrc = previous;
  video.dispatchEvent(new Event('loadeddata'));
  video.dispatchEvent(new Event('error'));
  assert.equal(ready, 1);
  assert.equal(errors, 0);
  video.metadata();
  video.data();
  assert.equal(ready, 2);
  assert.equal(video.currentTime, 0);
  assert.deepEqual(video.loads.map(url => new URL(url).pathname), ['/assets/living-room.mp4', '/assets/bedroom.mp4']);
});

test('a rejected early seek retries and unsolicited playback remains paused', () => {
  const video = new Video();
  const scrubber = new VideoScrubber(video);
  scrubber.load('assets/nursery.mp4');
  video.metadata(5.041667);
  video.rejectSeek = true;
  scrubber.setProgress(1);
  assert.equal(video.currentTime, 0);
  video.rejectSeek = false;
  video.data();
  assert.equal(video.currentTime, 5);
  const pauses = video.pauses;
  video.dispatchEvent(new Event('play'));
  assert.equal(video.pauses, pauses + 1);
});
