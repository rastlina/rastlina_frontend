import { clampProgress, finalFrameTime } from './media.mjs';
import { storyFrame } from './story-sequence.mjs';

// Media-clock playback. Only transitions use animation frames; playing footage
// is never repeatedly sought. The same sequence drives copy in both modes.
export class StoryAutoplay {
  constructor(sequence, { requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame, onState = () => {}, onComplete = () => {}, transitionMs = 900, stallMs = 15000, setTimer = (callback, delay) => globalThis.setTimeout(callback, delay), clearTimer = id => globalThis.clearTimeout(id) } = {}) {
    Object.assign(this, { sequence, requestFrame, cancelFrame, onState, onComplete, transitionMs, stallMs, setTimer, clearTimer });
    this.recoveries = new Map();
    this.index = 0;
    this.generation = 0;
    this.enabled = false;
    this.active = false;
    this.userPaused = false;
    this.blocked = false;
    this.phase = 'playing';
    this.elapsed = 0;
    this.removers = [];
    for (const [index, entry] of sequence.entries.entries()) {
      const video = entry.layer.video;
      const listen = (event, handler) => {
        video.addEventListener(event, handler);
        this.removers.push(() => video.removeEventListener(event, handler));
      };
      for (const event of ['loadeddata', 'canplay', 'seeked']) listen(event, () => {
        if (index === this.index) this.play();
        if (index === this.index + 1 && this.phase === 'transition') this.animate();
      });
      listen('timeupdate', () => {
        if (!this.running || index !== this.index || this.phase !== 'playing' || video.seeking) return;
        if (video.currentTime !== this.lastMediaTime) {
          this.lastMediaTime = video.currentTime;
          this.watchPlayback(index, true);
        }
        const last = finalFrameTime(video.duration);
        if (last) sequence.setProgress((index + .8 * clampProgress(video.currentTime / last)) / sequence.entries.length);
      });
      listen('ended', () => {
        if (!this.running || index !== this.index) return;
        this.clearWatchdog();
        this.phase = 'transition';
        this.elapsed = 0;
        this.lastTime = null;
        this.animate();
      });
      listen('error', () => { if (index === this.index && this.enabled) this.pause(); });
    }
  }
  get running() { return this.enabled && this.active && !this.userPaused; }
  get entry() { return this.sequence.entries[this.index]; }
  enable(progress = this.sequence.progress) {
    this.disable();
    this.enabled = true;
    this.recoveries.clear();
    this.restoreIndex = undefined;
    this.userPaused = false;
    const state = storyFrame(progress, this.sequence.entries.length);
    this.phase = state.movie >= 1 && progress < 1 ? 'transition' : 'playing';
    this.elapsed = Math.max(0, (progress * this.sequence.entries.length - state.index - .8) / .2) * this.transitionMs;
    this.index = state.index;
    this.sequence.trimPlayback(this.index);
    this.sequence.setProgress(progress);
    this.entry.scrubber.playback = true;
    this.onState(true);
    if (this.phase === 'transition') this.animate();
    else this.play();
  }
  disable() {
    this.clearWatchdog();
    this.generation++;
    this.playPending = false;
    this.primePending = false;
    this.enabled = false;
    this.sequence.waitingForNext = false;
    this.stopFrame();
    for (const entry of this.sequence.entries) {
      entry.layer.video.autoplay = false;
      entry.layer.video.pause();
      entry.scrubber.playback = false;
    }
  }
  clearWatchdog() {
    if (this.watchdog !== undefined) this.clearTimer(this.watchdog);
    this.watchdog = undefined;
  }
  watchPlayback(index, reset = false) {
    if (reset) this.clearWatchdog();
    if (!this.running || this.watchdog !== undefined) return;
    this.watchdog = this.setTimer(() => {
      this.watchdog = undefined;
      if (!this.running) return;
      const entry = this.sequence.entries[index];
      if (!entry || entry.failed) return;
      if ((this.recoveries.get(index) || 0) >= 1) {
        entry.scrubber.fail();
        this.pause();
        return;
      }
      this.recoveries.set(index, 1);
      // A stalled network/decoder gets one fresh source load, preserving the
      // chapter position. A second stall exposes Retry instead of looping.
      this.generation++;
      this.playPending = this.primePending = false;
      if (this.phase === 'playing') this.restoreIndex = index;
      this.sequence.reload(index);
      if (this.phase === 'transition') this.animate();
      else this.play();
    }, this.stallMs);
    this.watchdog?.unref?.();
  }
  play() {
    if (!this.running || this.phase !== 'playing' || this.playPending) return;
    this.watchPlayback(this.index);
    const entry = this.entry;
    const video = entry.layer.video;
    if (this.restoreIndex === this.index) {
      if (video.readyState < 1) return;
      entry.scrubber.playback = false;
      entry.scrubber.flush();
      if (video.seeking) return;
      this.restoreIndex = undefined;
    }
    entry.scrubber.playback = true;
    if (entry.failed || !entry.loaded || video.seeking || !video.paused) return;
    video.muted = video.defaultMuted = true;
    video.playsInline = true;
    video.autoplay = true;
    const index = this.index;
    const generation = this.generation;
    this.playPending = true;
    try {
      Promise.resolve(video.play()).then(() => { if (generation === this.generation) this.playPending = false; }, error => {
        if (generation !== this.generation) return;
        this.playPending = false;
        // A browser may interrupt play while metadata or a seek settles.
        // Keep autoplay armed so the next readiness event can retry.
        if (error?.name === 'AbortError') return;
        if (this.enabled && this.active && this.index === index) {
          this.pause();
          this.blocked = error?.name === 'NotAllowedError';
        }
      });
    } catch { this.playPending = false; this.pause(); }
  }
  stopPriming() {
    this.primePending = false;
    for (const [index, entry] of this.sequence.entries.entries()) {
      if (index === this.index || !entry.scrubber.playback) continue;
      entry.layer.video.pause();
      entry.layer.video.autoplay = false;
      entry.scrubber.playback = false;
    }
  }
  primeIncoming() {
    const index = this.index + 1;
    const entry = this.sequence.entries[index];
    if (!entry || entry.ready || entry.failed || this.primePending || !this.running) return;
    const generation = this.generation;
    const video = entry.layer.video;
    entry.scrubber.playback = true;
    video.muted = video.defaultMuted = true;
    video.playsInline = true;
    this.primePending = true;
    const finish = () => {
      if (generation !== this.generation) return;
      this.primePending = false;
      if (this.index !== index) {
        video.pause();
        entry.scrubber.playback = false;
        entry.scrubber.setProgress(0);
      }
    };
    try {
      Promise.resolve(video.play()).then(finish, error => {
        if (generation !== this.generation) return;
        finish();
        if (error?.name === 'NotAllowedError') { this.pause(); this.blocked = true; }
        else if (error?.name !== 'AbortError') entry.scrubber.fail();
      });
    } catch { finish(); entry.scrubber.fail(); }
  }
  setActive(active) {
    if (this.active === active) return;
    this.active = active;
    if (!active) { this.clearWatchdog(); this.stopPriming(); this.generation++; this.playPending = false; this.entry.layer.video.autoplay = false; this.entry.layer.video.pause(); this.stopFrame(); }
    else if (this.phase === 'transition') this.animate();
    else this.play();
  }
  pause() {
    this.clearWatchdog();
    this.stopPriming();
    this.generation++;
    this.playPending = false;
    this.blocked = false;
    this.entry.layer.video.autoplay = false;
    this.userPaused = true;
    this.entry.layer.video.pause();
    this.stopFrame();
    this.onState(false);
  }
  resume() {
    this.recoveries.clear();
    this.blocked = false;
    if (this.phase === 'complete') this.enable(0);
    else {
      this.userPaused = false;
      this.onState(true);
      if (this.phase === 'transition') this.animate();
      else this.play();
    }
  }
  stopFrame() {
    if (this.frame !== undefined) this.cancelFrame(this.frame);
    this.frame = undefined;
    this.lastTime = null;
  }
  animate() {
    if (!this.running || this.phase !== 'transition' || this.frame !== undefined) return;
    const incoming = this.sequence.entries[this.index + 1];
    this.sequence.waitingForNext = Boolean(incoming && !incoming.ready);
    this.sequence.reportState();
    if (this.sequence.waitingForNext) {
      this.watchPlayback(this.index + 1);
      this.sequence.ensure(this.index + 1);
      this.primeIncoming();
      this.lastTime = null;
      return;
    }
    this.clearWatchdog();
    const tick = time => {
      this.frame = undefined;
      if (!this.running || this.phase !== 'transition') return;
      // Keep the handoff on its wall clock when a phone drops frames. Clamping
      // each frame stretches a 900 ms transition into several seconds.
      // Leaving the viewport already clears lastTime through stopFrame().
      if (this.lastTime !== null) this.elapsed += Math.max(0, time - this.lastTime);
      this.lastTime = time;
      const t = Math.min(1, this.elapsed / this.transitionMs);
      // setProgress at a chapter boundary preloads the following chapter.
      // Release the completed decoder first: loading before trimming briefly
      // allocates three decoders and can strand a mobile preload.
      if (t === 1 && this.index + 1 < this.sequence.entries.length) {
        this.sequence.trimPlayback(this.index + 1);
      }
      this.sequence.setProgress((this.index + .8 + .2 * t) / this.sequence.entries.length);
      if (t < 1) this.frame = this.requestFrame(tick);
      else {
        this.entry.layer.video.autoplay = false;
        this.entry.scrubber.playback = false;
        if (this.index === this.sequence.entries.length - 1) {
          this.phase = 'complete';
          this.userPaused = true;
          this.onState(false);
          this.onComplete();
        } else {
          this.index++;
          this.sequence.trimPlayback(this.index);
          this.phase = 'playing';
          this.entry.scrubber.playback = true;
          this.playPending = false;
          this.play();
        }
      }
    };
    this.lastTime = null;
    this.frame = this.requestFrame(tick);
  }
  dispose() { this.disable(); this.removers.forEach(remove => remove()); }
}
