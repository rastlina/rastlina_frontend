import { clampProgress, finalFrameTime } from './media.mjs';
import { storyFrame } from './story-sequence.mjs';

// Media-clock playback. Only transitions use animation frames; playing footage
// is never repeatedly sought. The same sequence drives copy in both modes.
export class StoryAutoplay {
  constructor(sequence, { requestFrame = requestAnimationFrame, cancelFrame = cancelAnimationFrame, onState = () => {}, transitionMs = 900 } = {}) {
    Object.assign(this, { sequence, requestFrame, cancelFrame, onState, transitionMs });
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
        const last = finalFrameTime(video.duration);
        if (last) sequence.setProgress((index + .8 * clampProgress(video.currentTime / last)) / sequence.entries.length);
      });
      listen('ended', () => {
        if (!this.running || index !== this.index) return;
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
    this.userPaused = false;
    const state = storyFrame(progress, this.sequence.entries.length);
    this.phase = state.movie >= 1 && progress < 1 ? 'transition' : 'playing';
    this.elapsed = Math.max(0, (progress * this.sequence.entries.length - state.index - .8) / .2) * this.transitionMs;
    this.index = state.index;
    this.sequence.setProgress(progress);
    this.entry.scrubber.playback = true;
    this.onState(true);
    if (this.phase === 'transition') this.animate();
    else this.play();
  }
  disable() {
    this.generation++;
    this.playPending = false;
    this.enabled = false;
    this.sequence.waitingForNext = false;
    this.stopFrame();
    for (const entry of this.sequence.entries) {
      entry.layer.video.autoplay = false;
      entry.layer.video.pause();
      entry.scrubber.playback = false;
    }
  }
  play() {
    if (!this.running || this.phase !== 'playing' || this.playPending) return;
    const entry = this.entry;
    const video = entry.layer.video;
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
        if (this.enabled && this.active && this.index === index) {
          this.pause();
          this.blocked = error?.name === 'NotAllowedError';
        }
      });
    } catch { this.playPending = false; this.pause(); }
  }
  setActive(active) {
    if (this.active === active) return;
    this.active = active;
    if (!active) { this.generation++; this.playPending = false; this.entry.layer.video.autoplay = false; this.entry.layer.video.pause(); this.stopFrame(); }
    else if (this.phase === 'transition') this.animate();
    else this.play();
  }
  pause() {
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
      this.sequence.ensure(this.index + 1);
      this.lastTime = null;
      return;
    }
    const tick = time => {
      this.frame = undefined;
      if (!this.running || this.phase !== 'transition') return;
      if (this.lastTime !== null) this.elapsed += Math.max(0, Math.min(64, time - this.lastTime));
      this.lastTime = time;
      const t = Math.min(1, this.elapsed / this.transitionMs);
      this.sequence.setProgress((this.index + .8 + .2 * t) / this.sequence.entries.length);
      if (t < 1) this.frame = this.requestFrame(tick);
      else {
        this.entry.layer.video.autoplay = false;
        this.entry.scrubber.playback = false;
        if (this.index === this.sequence.entries.length - 1) {
          this.phase = 'complete';
          this.userPaused = true;
          this.onState(false);
        } else {
          this.index++;
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
