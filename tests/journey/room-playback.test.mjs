import test from 'node:test';
import assert from 'node:assert/strict';
import { RoomPlayback } from '../../src/components/home/journey/room-playback.mjs';

class Video extends EventTarget {
  constructor() {
    super();
    Object.assign(this, { src: '', currentSrc: '', readyState: 0, duration: NaN,
      seeking: false, paused: true, time: 0, seeks: [], plays: [], loads: [] });
  }
  get currentTime() { return this.time; }
  set currentTime(value) { this.time = value; this.seeks.push(value); this.seeking = true; }
  pause() { this.paused = true; }
  play() {
    this.plays.push({ source: this.src, time: this.currentTime });
    if (this.playResult) return this.playResult();
    this.paused = false;
    return Promise.resolve();
  }
  load() {
    this.loads.push(this.src);
    this.currentSrc = '';
    this.readyState = 0;
    this.time = 0;
    this.seeking = false;
    this.paused = true;
  }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  decoded() {
    this.currentSrc = this.src;
    this.duration = 10.041667;
    this.readyState = 1;
    this.dispatchEvent(new Event('loadedmetadata'));
    this.readyState = 2;
    this.dispatchEvent(new Event('loadeddata'));
  }
  completeSeek() { this.seeking = false; this.dispatchEvent(new Event('seeked')); }
  advance(time) { this.time = time; this.dispatchEvent(new Event('timeupdate')); }
  end() {
    this.advance(this.duration);
    this.paused = true;
    this.dispatchEvent(new Event('ended'));
  }
}

function fixture() {
  let now = 0, nextId = 0;
  const timers = new Map();
  const video = new Video();
  const states = [], frames = [];
  let ready = 0, errors = 0;
  const playback = new RoomPlayback(video, {
    setTimer: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimer: id => timers.delete(id),
    onState: value => states.push(value), onFrame: value => frames.push(value),
    onReady: () => ready++, onError: () => errors++,
  });
  return { video, playback, timers, states, frames,
    get ready() { return ready; }, get errors() { return errors; },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        timers.delete(due[0]); now = due[1].at; due[1].callback();
      }
      now = end;
    },
    async start(room = 'living-room') {
      playback.load(`assets/${room}-v4.mp4`);
      video.decoded();
      await Promise.resolve();
    },
  };
}

test('a transient room play interruption retries when data arrives without requiring Play', async () => {
  const f = fixture();
  try {
    f.video.playResult = () => Promise.reject(Object.assign(new Error('seek interrupted play'), { name: 'AbortError' }));
    await f.start('bedroom');
    assert.equal(f.playback.phase, 'playing');
    f.video.playResult = undefined;
    f.video.dispatchEvent(new Event('canplay'));
    await Promise.resolve();
    assert.equal(f.video.paused, false);
    assert.equal(f.states.at(-1), true);
  } finally { f.playback.dispose(); }
});

test('offscreen room media releases its decoder and restores its frame and manual pause', async () => {
  const f = fixture();
  try {
    await f.start('office');
    f.video.advance(4);
    f.playback.release();
    assert.equal(f.video.src, '');
    assert.equal(f.timers.size, 0);
    f.playback.setActive(true);
    f.video.decoded(); f.video.completeSeek(); await Promise.resolve();
    assert.equal(f.video.currentTime, 4);
    assert.equal(f.video.paused, false);
    f.playback.pause();
    f.playback.release();
    f.playback.setActive(true);
    f.video.decoded(); f.video.completeSeek(); await Promise.resolve();
    assert.equal(f.video.currentTime, 4);
    assert.equal(f.video.paused, true);
    assert.equal(f.playback.phase, 'paused');
  } finally { f.playback.dispose(); }
});

for (const room of ['living-room', 'bedroom', 'office']) test(`${room} plays naturally, resets to its first decoded frame, waits exactly five seconds, and repeats`, async () => {
  const f = fixture();
  await f.start(room);
  assert.equal(f.video.plays.length, 1);
  assert.equal(f.video.muted, true);
  assert.equal(f.video.playsInline, true);
  assert.equal(f.video.loop, false, 'Native looping must not skip the five-second hold');
  f.video.advance(5);
  assert.equal(f.frames.at(-1), 0.5);
  assert.deepEqual(f.video.seeks, [], 'Natural playback must not seek on each frame');
  f.video.end();
  assert.equal(f.video.currentTime, 0);
  assert.equal(f.video.paused, true);
  assert.equal(f.playback.phase, 'resetting');
  f.advance(3500);
  assert.equal(f.video.plays.length, 1, 'Reset decoding time does not count toward the hold');
  f.video.completeSeek();
  assert.equal(f.playback.phase, 'waiting');
  assert.equal(f.frames.at(-1), 0);
  f.advance(4999);
  assert.equal(f.video.plays.length, 1);
  assert.equal(f.video.paused, true);
  f.advance(1);
  await Promise.resolve();
  assert.equal(f.video.plays.length, 2);
  assert.equal(f.video.plays.at(-1).time, 0);
  assert.equal(f.video.paused, false);
  f.video.end(); f.video.completeSeek(); f.advance(5000);
  await Promise.resolve();
  assert.equal(f.video.plays.length, 3, 'Further cycles use the same hold');
  assert.equal(f.errors, 0);
  f.playback.dispose();
  assert.equal(f.timers.size, 0);
});

test('changing rooms cancels the previous wait and stale callbacks cannot restart it', async () => {
  const f = fixture();
  await f.start();
  f.video.end(); f.video.completeSeek();
  const oldWait = [...f.timers.values()][0].callback;
  f.advance(2400);
  await f.start('office');
  oldWait();
  f.advance(5000);
  assert.equal(f.video.plays.length, 2);
  assert.ok(f.video.plays.at(-1).source.endsWith('/office-v4.mp4'));
  assert.equal(f.video.currentTime, 0);
  assert.equal(f.playback.phase, 'playing');
  f.playback.dispose();
});

test('pause cancels a waiting cycle; manual scrubbing stays paused until explicit resume', async () => {
  const f = fixture();
  await f.start();
  f.video.end(); f.video.completeSeek(); f.advance(2000);
  f.playback.pause(); f.advance(10000);
  assert.equal(f.video.plays.length, 1);
  assert.equal(f.states.at(-1), false);
  f.playback.setProgress(0.65);
  f.video.completeSeek();
  assert.equal(f.video.currentTime, 6.5);
  assert.equal(f.frames.at(-1), 0.65);
  assert.equal(f.video.paused, true);
  f.playback.resume();
  await Promise.resolve();
  assert.equal(f.video.plays.length, 2);
  assert.equal(f.video.plays.at(-1).time, 6.5);
  assert.equal(f.states.at(-1), true);
  f.playback.restart();
  assert.equal(f.video.currentTime, 0);
  assert.equal(f.video.plays.length, 2, 'Replay waits for its first frame to decode');
  f.video.completeSeek();
  await Promise.resolve();
  assert.equal(f.video.plays.length, 3);
  assert.equal(f.video.plays.at(-1).time, 0);
  f.playback.dispose();
});

test('leaving the view suspends playback and loop timers without overriding a manual pause', async () => {
  const f = fixture();
  await f.start();
  f.video.advance(4);
  f.playback.setActive(false);
  assert.equal(f.video.paused, true);
  f.advance(10000);
  assert.equal(f.video.plays.length, 1);
  f.playback.setActive(true);
  await Promise.resolve();
  assert.equal(f.video.plays.at(-1).time, 4);
  f.video.end(); f.video.completeSeek(); f.advance(2000);
  f.playback.setActive(false); f.advance(10000);
  assert.equal(f.video.plays.length, 2);
  f.playback.setActive(true); f.advance(4999);
  assert.equal(f.video.plays.length, 2);
  f.advance(1); await Promise.resolve();
  assert.equal(f.video.plays.length, 3);
  f.playback.pause();
  f.playback.setActive(false); f.playback.setActive(true);
  assert.equal(f.video.plays.length, 3, 'Re-entering must preserve manual pause');
  f.playback.dispose();
});

test('a failed load or reset exposes recovery; retry starts a fresh cycle', async () => {
  const f = fixture();
  f.playback.load('assets/bedroom-v4.mp4');
  f.advance(20000);
  assert.equal(f.errors, 1);
  f.video.decoded();
  assert.equal(f.video.plays.length, 0, 'Late data cannot revive a failed cycle');
  await f.start('bedroom');
  assert.equal(f.ready, 1);
  assert.equal(f.video.plays.length, 1);
  f.video.end();
  f.advance(20000);
  assert.equal(f.errors, 2, 'A stalled first-frame reset must offer recovery');
  f.video.completeSeek(); f.advance(5000);
  assert.equal(f.video.plays.length, 1);
  await f.start('bedroom');
  assert.equal(f.video.plays.length, 2);
  assert.equal(f.video.currentTime, 0);
  f.playback.dispose();
});

test('blocked autoplay offers play control, and stale play rejections cannot pause a new room', async () => {
  const f = fixture();
  f.video.playResult = () => Promise.reject(new Error('Autoplay blocked'));
  await f.start();
  assert.equal(f.playback.phase, 'paused');
  assert.equal(f.states.at(-1), false);
  f.video.playResult = null;
  f.playback.resume(); await Promise.resolve();
  assert.equal(f.video.paused, false);
  let rejectOldPlay;
  f.video.playResult = () => new Promise((resolve, reject) => { rejectOldPlay = reject; });
  await f.start('bedroom');
  f.video.playResult = null;
  await f.start('office');
  rejectOldPlay(new Error('Previous room was interrupted'));
  await Promise.resolve();
  assert.equal(f.playback.phase, 'playing');
  assert.equal(f.video.paused, false);
  assert.equal(f.states.at(-1), true);
  f.playback.dispose();
});

test('dispose cancels a pending replay, releases media and ignores late events', async () => {
  const f = fixture();
  await f.start();
  f.video.end(); f.video.completeSeek();
  const oldWait = [...f.timers.values()][0].callback;
  f.playback.dispose();
  oldWait(); f.advance(30000);
  f.video.dispatchEvent(new Event('ended'));
  f.video.dispatchEvent(new Event('loadeddata'));
  assert.equal(f.timers.size, 0);
  assert.equal(f.video.src, '');
  assert.equal(f.video.paused, true);
  assert.equal(f.video.plays.length, 1);
});

test('touch selection starts a room before a mobile browser emits loadeddata',async()=>{
  const f=fixture();try{
    f.playback.load('assets/office-mobile-v5.mp4');f.playback.restart();
    assert.equal(f.video.readyState,0);assert.equal(f.video.plays.length,1);
    assert.equal(f.video.defaultMuted,true);assert.equal(f.video.playsInline,true);
    await Promise.resolve();f.video.decoded();
    assert.equal(f.video.paused,false);assert.equal(f.video.plays.length,1);
  }finally{f.playback.dispose();}
});
