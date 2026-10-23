import { clampProgress, finalFrameTime } from './media.mjs';

// Room films run on the media clock. Only explicit scrubbing and the loop reset
// seek; document scrolling never writes to the room video's currentTime.
export class RoomPlayback {
  constructor(video, { onReady = () => {}, onError = () => {}, onFrame = () => {}, onState = () => {},
    setTimer = (callback, delay) => globalThis.setTimeout(callback, delay),
    clearTimer = id => globalThis.clearTimeout(id) } = {}) {
    Object.assign(this, { video, onReady, onError, onFrame, onState, setTimer, clearTimer });
    this.listeners = [];
    this.generation = 0;
    this.active = true;
    this.source = '';
    this.phase = 'paused';
    this.progress = 0;
    this.pendingSeek = null;
    const listen = (type, callback) => {
      video.addEventListener(type, callback);
      this.listeners.push(() => video.removeEventListener(type, callback));
    };
    for (const event of ['loadedmetadata', 'loadeddata', 'canplay', 'seeked']) listen(event, () => this.frameReady());
    listen('timeupdate', () => this.reportFrame());
    listen('ended', () => {
      if (!this.isCurrent() || this.phase !== 'playing') return;
      this.video.pause();
      this.phase = 'resetting';
      this.pendingSeek = 0;
      this.armTimeout();
      this.frameReady();
    });
    listen('error', () => { if (this.isCurrent()) this.fail(); });
  }
  isCurrent() { return !this.failed && !this.suspended && this.source && (this.video.currentSrc || this.video.src) === this.source; }
  cancelTimers() {
    this.clearTimer(this.waitTimer);
    this.clearTimer(this.timeout);
    this.waitTimer = this.timeout = null;
  }
  armTimeout() {
    this.clearTimer(this.timeout);
    this.timeout = this.setTimer(() => this.fail(), 20000);
    this.timeout?.unref?.();
  }
  load(url) {
    this.generation++;
    this.cancelTimers();
    this.video.pause();
    Object.assign(this, { failed: false, suspended: false, ready: false, progress: 0, pendingSeek: null, phase: 'loading', playPending: false });
    this.onState(true);
    this.onFrame(0);
    try {
      this.source = new URL(url, typeof location === 'undefined' ? 'https://example.test/' : location.href).href;
      Object.assign(this.video, { muted: true, defaultMuted: true, playsInline: true, loop: false, preload: 'auto', src: this.source });
      this.armTimeout();
      this.video.load();
    } catch { this.fail(); }
  }
  reportFrame() {
    if (!this.isCurrent() || this.video.readyState < 2 || this.video.seeking || this.pendingSeek !== null) return;
    const last = finalFrameTime(this.video.duration);
    this.progress = last ? clampProgress(this.video.currentTime / last) : 0;
    this.onFrame(this.progress);
  }
  frameReady() {
    if (!this.isCurrent() || this.video.readyState < 1 || this.video.seeking) return;
    if (this.pendingSeek !== null) {
      const target = Math.round(this.pendingSeek * finalFrameTime(this.video.duration) * 24) / 24;
      if (Math.abs(this.video.currentTime - target) >= 0.5 / 24) {
        try { this.video.currentTime = target; this.armTimeout(); } catch { /* Retry when data arrives. */ }
        return;
      }
      if (this.video.readyState < 2) return;
      this.pendingSeek = null;
    }
    if (this.video.readyState < 2) return;
    this.clearTimer(this.timeout);
    this.timeout = null;
    if (!this.ready) { this.ready = true; this.onReady(); }
    this.reportFrame();
    if (this.phase === 'resetting') {
      // The five seconds start only once the reset has decoded the first frame.
      this.phase = 'waiting';
      this.waitToReplay();
    } else if (this.phase === 'loading' || this.phase === 'playing') {
      this.phase = 'playing';
      this.play();
    }
  }
  waitToReplay() {
    if (!this.active || this.waitTimer !== null && this.waitTimer !== undefined) return;
    const generation = this.generation;
    this.waitTimer = this.setTimer(() => {
      this.waitTimer = null;
      if (generation !== this.generation || !this.active || this.phase !== 'waiting') return;
      this.phase = 'playing';
      this.play();
    }, 5000);
    this.waitTimer?.unref?.();
  }
  play() {
    if (!this.isCurrent() || !this.active || (!this.ready && this.phase !== 'loading') || this.pendingSeek !== null || this.playPending || this.video.paused === false) return;
    const generation = this.generation;
    this.playPending = true;
    try {
      Promise.resolve(this.video.play()).then(() => {
        if (generation === this.generation) this.playPending = false;
      }, error => {
        if (generation !== this.generation) return;
        this.playPending = false;
        // Loading or seeking can interrupt a pending play on mobile. Readiness
        // events retry it without turning that interruption into a user pause.
        if (error?.name === 'AbortError') return;
        this.pause(); // A blocked autoplay can be resumed with the visible button.
      });
    } catch { this.playPending = false; this.pause(); }
  }
  pause() {
    this.generation++;
    this.clearTimer(this.waitTimer);
    this.waitTimer = null;
    this.playPending = false;
    this.phase = 'paused';
    this.video.pause();
    this.onState(false);
  }
  resume() {
    if (this.failed || !this.source) return;
    this.phase = this.ready ? 'playing' : 'loading';
    this.onState(true);
    this.frameReady();
    // Start loading playback on touch-selected rooms even if paused preload is deferred.
    if (this.phase === 'loading' && this.video.currentTime === 0 && (this.pendingSeek === null || this.pendingSeek === 0)) {
      this.pendingSeek = null;
      this.play();
    }
  }
  setProgress(value) {
    if (this.failed || this.suspended || !this.source) return;
    // A drag can emit hundreds of positions. Pause once, keep the latest
    // target, and let the decoder finish its single outstanding seek.
    if (this.phase !== 'paused') this.pause();
    this.progress = clampProgress(value);
    this.pendingSeek = this.progress;
    if (this.video.seeking) return;
    if (this.video.readyState < 2 && (this.timeout === null || this.timeout === undefined)) this.armTimeout();
    this.frameReady();
  }
  restart() {
    this.setProgress(0);
    this.resume();
  }
  setActive(active) {
    if (this.active === active) return;
    this.active = active;
    if (!active) {
      this.generation++;
      this.playPending = false;
      this.clearTimer(this.waitTimer);
      this.waitTimer = null;
      this.video.pause();
    } else if (this.suspended) {
      const { source, progress, phase } = this;
      this.load(source);
      this.progress = progress;
      this.pendingSeek = progress;
      this.phase = phase === 'paused' ? 'paused' : phase === 'waiting' || phase === 'resetting' ? 'resetting' : 'loading';
      this.onState(this.phase !== 'paused');
    } else if (this.phase === 'waiting') this.waitToReplay();
    else if (this.phase === 'playing' || this.phase === 'loading') this.frameReady();
  }
  release() {
    if (!this.source || this.suspended || this.failed) return;
    this.setActive(false);
    this.cancelTimers();
    this.suspended = true;
    this.ready = false;
    this.video.removeAttribute?.('src');
    this.video.load();
  }
  fail() {
    if (this.failed) return;
    this.failed = true;
    this.cancelTimers();
    this.pause();
    this.onError();
  }
  dispose() {
    this.cancelTimers();
    this.pause();
    this.failed = true;
    this.listeners.forEach(remove => remove());
    this.video.removeAttribute?.('src');
    this.video.load();
  }
}
