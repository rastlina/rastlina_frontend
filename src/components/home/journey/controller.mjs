import { StoryAutoplay } from './story-autoplay.mjs';
import { RoomPlayback } from './room-playback.mjs';
import { StorySequence, STORY_CHAPTERS, storyProgress, copyTransition } from './story-sequence.mjs';
import { clampProgress, finalFrameTime } from './media.mjs';
export { clampProgress, finalFrameTime } from './media.mjs';

export const ROOMS = Object.freeze({
  'living-room': { name: 'Living Room', heading: 'Your space. More alive.', note: 'A little green, in your living room.' },
  bedroom: { name: 'Bedroom', heading: 'Rest easy. Breathe green.', note: 'A little green, beside your everyday moments.' },
  office: { name: 'Office', heading: 'Fresh thinking. Naturally.', note: 'A little green, at your desk.' },
});

export function sectionProgress(top, sectionHeight, stageHeight) {
  const travel = Math.max(1, Number(sectionHeight) - Number(stageHeight));
  return clampProgress(-Number(top) / travel);
}

export function cinematicProgress(progress) {
  // Let the viewer settle into the wide frame and see the ending before leaving.
  return clampProgress((clampProgress(progress) - 0.02) / 0.82);
}

export function nurseryProgress(progress) {
  // Finish the reveal before the overlapping room choices enter the viewport.
  return clampProgress((clampProgress(progress) - 0.02) / 0.56);
}

function smoothProgress(value) {
  const p = clampProgress(value);
  return p * p * (3 - 2 * p);
}

export function sceneDepth(movieProgress, scrollProgress, nursery = false, manual = false, reducedMotion = false) {
  if (manual) return { copyOpacity: 1, copyY: 0, copyZ: 0, sceneZ: 0, ambienceY: 0 };
  const departure = smoothProgress(clampProgress(movieProgress) / 0.22);
  const retreat = nursery
    ? smoothProgress((clampProgress(scrollProgress) - 0.6) / 0.4)
    : smoothProgress((clampProgress(scrollProgress) - 0.94) / 0.06);
  return {
    copyOpacity: 1 - departure,
    copyY: reducedMotion ? 0 : -56 * departure,
    copyZ: reducedMotion ? 0 : -180 * departure,
    sceneZ: reducedMotion ? 0 : -(nursery ? 96 : 36) * retreat,
    ambienceY: reducedMotion ? 0 : -24 * clampProgress(scrollProgress),
  };
}

export function choiceDepth(top, viewportHeight, index, manual = false) {
  if (manual) return { y: 0, z: 0, turn: 0, opacity: 1 };
  const entry = clampProgress(1 - top / Math.max(1, viewportHeight));
  const reveal = smoothProgress(entry * 1.4 - index * 0.15);
  return { y: 72 * (1 - reveal), z: -96 * (1 - reveal), turn: (1 - index) * 6 * (1 - reveal), opacity: 0.6 + 0.4 * reveal };
}

// Time-based easing works at 60/90/120 Hz and stops scheduling at rest.
export class ProgressSmoother {
  constructor(update, { requestFrame = requestAnimationFrame, responseMs = 55 } = {}) {
    this.update = update;
    this.requestFrame = requestFrame;
    this.responseMs = responseMs;
    this.value = this.target = 0;
    this.pending = false;
    this.generation = 0;
    this.lastTime = null;
  }
  reset(value = 0) {
    this.generation++;
    this.pending = false;
    this.lastTime = null;
    this.value = this.target = clampProgress(value);
  }
  setTarget(value, immediate = false) {
    if (immediate) {
      this.reset(value);
      this.update(this.value);
      return;
    }
    this.target = clampProgress(value);
    if (this.pending || this.target === this.value) return;
    this.pending = true;
    this.lastTime = null;
    const generation = this.generation;
    const tick = time => {
      if (generation !== this.generation) return;
      const now = Number.isFinite(time) ? time : performance.now();
      const elapsed = this.lastTime === null ? 16.67 : Math.max(1, Math.min(64, now - this.lastTime));
      this.lastTime = now;
      this.value += (this.target - this.value) * (1 - Math.exp(-elapsed / this.responseMs));
      if (Math.abs(this.target - this.value) < 0.001) this.value = this.target;
      this.update(this.value);
      this.pending = this.value !== this.target;
      if (this.pending) this.requestFrame(tick);
      else this.lastTime = null;
    };
    this.requestFrame(tick);
  }
}

export class VideoScrubber {
  constructor(video, { fps = 24, onReady = () => {}, onError = () => {}, onFrame = () => {}, timeoutMs = 20000, setTimer = (callback, delay) => globalThis.setTimeout(callback, delay), clearTimer = id => globalThis.clearTimeout(id) } = {}) {
    this.video = video;
    this.listeners = [];
    this.listen = (type, handler) => {
      video.addEventListener(type, handler);
      this.listeners.push(() => video.removeEventListener(type, handler));
    };
    this.fps = fps;
    this.onReady = onReady;
    this.onError = onError;
    this.onFrame = onFrame;
    this.setTimer = setTimer;
    this.clearTimer = clearTimer;
    this.timeoutMs = timeoutMs;
    this.timeout = null;
    this.seekTimeout = null;
    this.progress = 0;
    this.source = '';
    this.ready = false;
    this.failed = false;
    this.listen('loadedmetadata', () => this.flush());
    for (const event of ['loadeddata', 'canplay', 'seeked']) {
      this.listen(event, () => { this.frameReady(); this.flush(); });
    }
    this.listen('error', () => {
      if (this.source && this.isCurrentSource()) this.fail();
    });
    this.listen('play', () => { if (!this.playback) video.pause(); });
  }
  dispose() {
    this.clearTimer(this.timeout);
    this.clearTimer(this.seekTimeout);
    this.listeners.forEach(remove => remove());
    this.failed = true;
    this.video.pause();
    this.video.removeAttribute?.('src');
    this.video.load();
  }
  isCurrentSource() {
    const activeSource = this.video.currentSrc || this.video.src;
    return activeSource === this.source;
  }
  load(url) {
    this.clearTimer(this.timeout);
    this.clearTimer(this.seekTimeout);
    this.progress = 0;
    this.ready = false;
    this.failed = false;
    try {
      this.source = new URL(url, typeof location === 'undefined' ? 'https://example.test/' : location.href).href;
      this.video.pause();
      this.video.muted = true;
      this.video.playsInline = true;
      this.video.preload = 'auto';
      this.timeout = this.setTimer(() => {
        if (!this.ready) this.fail();
      }, this.timeoutMs);
      this.timeout?.unref?.();
      this.video.src = this.source;
      this.video.load();
    } catch {
      this.fail();
    }
  }
  frameReady() {
    const video = this.video;
    if (this.failed || !this.source || !this.isCurrentSource() || video.readyState < 2 || video.seeking) return;
    const last = finalFrameTime(video.duration, this.fps);
    this.clearTimer(this.timeout);
    this.clearTimer(this.seekTimeout);
    if (!this.ready) { this.ready = true; this.onReady(); }
    this.onFrame(last ? clampProgress(video.currentTime / last) : 0);
  }
  fail() {
    if (this.failed) return;
    this.failed = true;
    this.ready = false;
    this.clearTimer(this.timeout);
    this.clearTimer(this.seekTimeout);
    try { this.video.pause(); } catch { /* Recovery must also handle a media API exception. */ }
    this.onError();
  }
  setProgress(value) {
    this.progress = clampProgress(value);
    this.flush();
  }
  flush() {
    const video = this.video;
    if (this.playback || this.failed || !this.source || !this.isCurrentSource() || video.readyState < 1 || video.seeking) return;
    const last = finalFrameTime(video.duration, this.fps);
    const target = Math.round(this.progress * last * this.fps) / this.fps;
    if (Math.abs(video.currentTime - target) < 0.5 / this.fps) return;
    try {
      video.currentTime = target;
      this.clearTimer(this.seekTimeout);
      this.seekTimeout = this.setTimer(() => {
        if (this.isCurrentSource() && video.seeking) this.fail();
      }, this.timeoutMs);
      this.seekTimeout?.unref?.();
    } catch { /* A later metadata/scroll event retries. */ }
  }
}

export function roomSelection(id, mobile = false, assetBase = 'assets') {
  if (!Object.hasOwn(ROOMS, id)) throw new Error('Unknown room');
  const room = ROOMS[id];
  return { id, ...room, video: `${assetBase}/${id}${mobile ? "-mobile-v5" : "-v4"}.mp4`, poster: `${assetBase}/${id}-start.webp` };
}

export function mountJourney(root = document, { assetBase = 'assets', scrollOffset = 0, autoplay = true } = {}) {
  const byId = id => root.getElementById ? root.getElementById(id) : root.querySelector(`#${id}`);
  const surface = root.documentElement || root;
  let disposed = false;
  const removers = [];
  const frames = new Set();
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  }
  function requestFrame(callback) {
    const id = requestAnimationFrame(time => {
      frames.delete(id);
      if (!disposed) callback(time);
    });
    frames.add(id);
    return id;
  }
  // Full-screen crops need the sharper source on high-density phones.
  const connection = globalThis.navigator?.connection;
  const mobileMedia = Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType || '') ||
    (matchMedia('(max-width: 700px)').matches && (globalThis.devicePixelRatio || 1) < 1.5);
  const introSection = byId('nursery-story');
  const roomSection = byId('room-story');
  const choices = byId('room-choices');
  const nurseryRange = byId('nursery-range');
  const roomRange = byId('room-range');
  const roomWindow = byId('room-window');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compactViewport = matchMedia('(max-width: 620px) and (max-height: 520px)');
  const cards = [...root.querySelectorAll('[data-room]')];
  const roomCards = cards.filter(card => card.classList.contains('room-card'));
  let selected = null;
  let storyMode = autoplay ? 'auto' : 'scroll';
  let scrollAnimationEnabled = false;
  const modeButton = byId('journey-mode-switch');
  const nurseryPlayButton = byId('nursery-playback');
  surface.classList.toggle('is-autoplay', storyMode === 'auto');
  surface.classList.toggle('is-scroll-mode', storyMode === 'scroll');
  let framePending = false;
  let introManual = false;
  let scrollIntent = false;
  let selecting = false;
  let arrivalGeneration = 0;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  // Reduced motion keeps the essential scroll-controlled film, without inertia
  // or decorative movement. Only a viewport too short for the stage stacks it.
  function manualMode() { return compactViewport.matches; }
  function reduceEffects() { return reducedMotion.matches || manualMode(); }
  function syncMode() {
    surface.classList.toggle('manual-mode', manualMode());
    introMotion.reset(introScrubber.progress);
    schedule();
  }
  function syncRange(range, progress) {
    const value = Math.round(clampProgress(progress) * 1000);
    range.value = String(value);
    range.style.setProperty('--progress', `${value / 10}%`);
    const description = value === 0 ? range.dataset.start : value === 1000 ? range.dataset.end : `${Math.round(value / 10)}% through the view`;
    range.setAttribute('aria-valuetext', description);
  }
  function applyDepth(section, movieProgress, rawProgress, nursery = false) {
    const state = sceneDepth(movieProgress, rawProgress, nursery, manualMode(), reducedMotion.matches);
    section.style.setProperty('--copy-opacity', String(state.copyOpacity));
    section.style.setProperty('--copy-y', `${state.copyY}px`);
    section.style.setProperty('--copy-z', `${state.copyZ}px`);
    section.style.setProperty('--scene-z', `${state.sceneZ}px`);
    section.style.setProperty('--ambience-y', `${state.ambienceY}px`);
  }
  function updateChoices() {
    const top = choices.getBoundingClientRect().top - scrollOffset;
    const height = introSection.querySelector('.chapter-stage').offsetHeight;
    roomCards.forEach((card, index) => {
      const state = choiceDepth(top, height, index, reduceEffects());
      card.style.setProperty('--card-y', `${state.y}px`);
      card.style.setProperty('--card-z', `${state.z}px`);
      card.style.setProperty('--card-turn', `${state.turn}deg`);
      card.style.setProperty('--card-opacity', String(state.opacity));
    });
  }
  function showError(windowId, loadingId, errorId) {
    byId(windowId).classList.remove('has-video');
    byId(windowId).setAttribute('aria-busy', 'false');
    byId(loadingId).hidden = true;
    byId(errorId).hidden = false;
  }
  function updateRoomFinish(progress) {
    const complete = progress >= 0.985;
    byId('orbit-readout').textContent = `${String(Math.round(progress * 100)).padStart(2, '0')} / 100`;
    byId('room-finish').classList.toggle('visible', complete);
    byId('room-finish').inert = !complete;
  }

  let shownChapter = -1;
  const currentCopy = byId('story-copy-current');
  const nextCopy = byId('story-copy-next');
  let copyTravel = 320;
  function measureCopy() {
    copyTravel = Math.max(currentCopy.offsetHeight, nextCopy.offsetHeight, 160) + 32;
  }
  const introScrubber = new StorySequence(STORY_CHAPTERS.map((_, index) => ({
    element: byId(`story-frame-${index + 1}`),
    video: byId(index === 0 ? 'nursery-video' : `story-video-${index + 1}`),
  })), {
    Scrubber: VideoScrubber, assetBase, mobile: mobileMedia,
    onView: ({ index, chapter, blend }) => {
      if (shownChapter !== index) {
        shownChapter = index;
        byId('nursery-heading').innerHTML = chapter.title;
        byId('story-note').innerHTML = chapter.note;
        byId('story-eyebrow').textContent = chapter.label;
        byId('story-number').textContent = String(index + 1).padStart(2, '0');
        byId('story-position').textContent = `${index + 1} / ${STORY_CHAPTERS.length}`;
        const next = STORY_CHAPTERS[Math.min(index + 1, STORY_CHAPTERS.length - 1)];
        byId('next-story-heading').innerHTML = next.title;
        byId('next-story-note').innerHTML = next.note;
        byId('next-story-eyebrow').textContent = next.label;
        byId('next-story-number').textContent = String(Math.min(index + 2, STORY_CHAPTERS.length)).padStart(2, '0');
        introSection.style.setProperty('--scene-poster', `url("${assetBase}/${chapter.id}-start.webp")`);
        measureCopy();
      }
      const motion = copyTransition(blend, copyTravel, reduceEffects());
      currentCopy.style.setProperty('--text-y', `${motion.currentY}px`);
      nextCopy.style.setProperty('--text-y', `${motion.nextY}px`);
      nextCopy.style.visibility = motion.nextVisible ? 'visible' : 'hidden';
    },
    onState: ({ ready, failed }) => {
      byId('nursery-window').setAttribute('aria-busy', String(!ready && !failed));
      byId('nursery-loading').hidden = ready || failed;
      byId('nursery-error').hidden = !failed;
    },
  });
  const roomPlayback = new RoomPlayback(byId('room-video'), {
    onReady: () => { roomWindow.classList.add('has-video'); roomWindow.setAttribute('aria-busy', 'false'); byId('room-loading').hidden = true; },
    onError: () => { showError('room-window', 'room-loading', 'room-error'); updateRoomFinish(0); },
    onFrame: progress => {
      syncRange(roomRange, progress);
      updateRoomFinish(progress);
      // Keep the overlay legible throughout the room film.
      applyDepth(roomSection, 0, 0);
    },
    onState: playing => { byId('room-playback').textContent = playing ? 'Pause animation' : 'Play animation'; },
  });

  const introMotion = new ProgressSmoother(progress => {
    introScrubber.setProgress(progress);
    syncRange(nurseryRange, progress);
  }, { requestFrame });

  const autoStory = new StoryAutoplay(introScrubber, {
    requestFrame,
    cancelFrame: id => { cancelAnimationFrame(id); frames.delete(id); },
    onState: playing => { nurseryPlayButton.textContent = playing ? 'Pause animation' : 'Play animation'; },
  });

  function measuredProgress(section) {
    return sectionProgress(section.getBoundingClientRect().top - scrollOffset, section.offsetHeight, section.querySelector('.chapter-stage').offsetHeight);
  }
  function renderScroll() {
    framePending = false;
    const introPosition = measuredProgress(introSection);
    if (storyMode === 'scroll' && !manualMode() && !introManual) {
      const progress = storyProgress(introPosition);
      introMotion.setTarget(progress, reducedMotion.matches);
    }
    const introRect = introSection.getBoundingClientRect();
    autoStory.setActive(!document.hidden && introRect.top < window.innerHeight && introRect.top + introSection.offsetHeight > scrollOffset);
    const journeyRect = surface.getBoundingClientRect?.();
    modeButton.hidden = Boolean(journeyRect && (journeyRect.bottom < scrollOffset || journeyRect.top > window.innerHeight));
    document.body?.classList.toggle('has-journey-mode-control', !modeButton.hidden);
    if (selected) {
      if (scrollAnimationEnabled) roomPlayback.setProgress(cinematicProgress(measuredProgress(roomSection)));
      applyDepth(roomSection, 0, 0);
      const top = roomSection.getBoundingClientRect().top;
      roomPlayback.setActive(!document.hidden && (selecting || (top < window.innerHeight && top + roomSection.offsetHeight > scrollOffset)));
    }
    updateChoices();
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    byId('reading-progress').style.setProperty('--read-progress', String(clampProgress(scrollY / total)));
  }
  function schedule() {
    if (framePending) return;
    framePending = true;
    requestFrame(renderScroll);
  }
  function goTo(section) {
    const top = section.getBoundingClientRect().top + scrollY - scrollOffset;
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }
  function goToWideView() {
    const generation = ++arrivalGeneration;
    selecting = true;
    roomPlayback.setActive(true);
    roomPlayback.restart();
    if (scrollAnimationEnabled) roomPlayback.pause();
    goTo(roomSection);
    // Keep playback active while navigating to the chosen room.
    const started = performance.now();
    const waitForArrival = () => {
      if (generation !== arrivalGeneration) return;
      if (Math.abs(roomSection.getBoundingClientRect().top - scrollOffset) < 3 || performance.now() - started > 1600) {
        selecting = false;
        schedule();
      } else requestFrame(waitForArrival);
    };
    requestFrame(waitForArrival);
  }
  function selectRoom(id) {
    const selection = roomSelection(id, mobileMedia, assetBase);
    selected = selection;
    roomSection.hidden = false;
    roomWindow.classList.remove('has-video');
    roomWindow.setAttribute('aria-busy', 'true');
    byId('room-error').hidden = true;
    byId('room-loading').hidden = false;
    byId('room-poster').src = selection.poster;
    roomSection.style.setProperty('--scene-poster', `url("${selection.poster}")`);
    byId('room-poster').alt = `Rastlina plant in your ${selection.name.toLowerCase()}`;
    byId('room-video').poster = selection.poster;
    byId('room-video').setAttribute('aria-label', `${selection.name} camera orbit, plays automatically with a five-second pause between plays`);
    const heading = byId('room-heading');
    const [lead, ...rest] = selection.heading.split('. ');
    heading.textContent = `${lead}. `;
    const accent = document.createElement('em');
    accent.textContent = rest.join('. ');
    heading.append(accent);
    byId('room-eyebrow').textContent = selection.note;
    byId('room-label').textContent = selection.name;
    roomRange.setAttribute('aria-label', `Explore the ${selection.name.toLowerCase()} view`);
    cards.forEach(card => card.setAttribute('aria-pressed', String(card.dataset.room === id)));
    byId('selection-status').textContent = `${selection.name} selected. The animation plays automatically, returns to the wide view, then plays again after five seconds. Use Pause animation or drag Explore the view for manual control.`;
    byId('orbit-readout').textContent = '00 / 100';
    roomPlayback.load(selection.video);
    goToWideView();
    byId('room-heading').focus({ preventScroll: true });
  }

  function noteScrollIntent(event) {
    if (event.type === 'keydown' && !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
    if (event.type === 'keydown' && /^(INPUT|BUTTON|A)$/.test(document.activeElement?.tagName || '')) return;
    scrollIntent = true;
    if (selecting) { arrivalGeneration++; selecting = false; }
    introManual = false;
  }
  listen(window, 'wheel', noteScrollIntent, { passive: true });
  listen(window, 'touchstart', noteScrollIntent, { passive: true });
  listen(window, 'keydown', noteScrollIntent);
  listen(window, 'scroll', () => {
    if (scrollIntent) introManual = false;
    schedule();
  }, { passive: true });
  function refreshCopyLayout() {
    measureCopy();
    introScrubber.setProgress(introScrubber.progress);
    schedule();
  }
  listen(window, 'resize', refreshCopyLayout, { passive: true });
  const copyObserver = globalThis.ResizeObserver ? new ResizeObserver(refreshCopyLayout) : null;
  copyObserver?.observe(currentCopy);
  copyObserver?.observe(nextCopy);
  removers.push(() => copyObserver?.disconnect());
  listen(reducedMotion, 'change', syncMode);
  listen(compactViewport, 'change', syncMode);
  listen(window, 'pageshow', schedule);
  listen(document, 'visibilitychange', schedule);
  listen(window, 'pagehide', () => {
    introMotion.reset(introScrubber.progress);
    autoStory.setActive(false);
    roomPlayback.setActive(false);
  });

  listen(modeButton, 'click', () => {
    const roomTop = selected ? roomSection.getBoundingClientRect().top : Infinity;
    const inRoom = selected && roomTop < window.innerHeight && roomTop + roomSection.offsetHeight > scrollOffset;
    const progress = introScrubber.progress;
    autoStory.disable();
    scrollAnimationEnabled = !scrollAnimationEnabled;
    storyMode = scrollAnimationEnabled ? 'scroll' : 'auto';
    surface.classList.toggle('is-autoplay', storyMode === 'auto');
    surface.classList.toggle('is-scroll-mode', scrollAnimationEnabled);
    surface.classList.toggle('is-room-scroll', scrollAnimationEnabled);
    modeButton.setAttribute('aria-pressed', String(scrollAnimationEnabled));
    modeButton.setAttribute('aria-label', scrollAnimationEnabled ? 'Disable scroll animation and play automatically' : 'Enable scroll animation');
    byId('journey-mode-state').textContent = scrollAnimationEnabled ? 'On' : 'Off';
    introManual = false;
    introMotion.reset(progress);
    if (storyMode === 'auto') autoStory.enable(progress >= 1 ? 0 : progress);
    if (inRoom) {
      goTo(roomSection);
      if (scrollAnimationEnabled) roomPlayback.setProgress(0);
      else roomPlayback.resume();
    } else if (storyMode === 'scroll') {
      const travel = Math.max(1, introSection.offsetHeight - introSection.querySelector('.chapter-stage').offsetHeight);
      const top = introSection.getBoundingClientRect().top + scrollY - scrollOffset;
      window.scrollTo({ top: top + travel * (.01 + .84 * progress), behavior: 'auto' });
    } else {
      goTo(introSection);
    }
    schedule();
  });
  listen(nurseryPlayButton, 'click', () => {
    if (autoStory.userPaused) autoStory.resume();
    else autoStory.pause();
  });
  listen(nurseryRange, 'input', () => {
    scrollIntent = false;
    introManual = true;
    introMotion.reset(Number(nurseryRange.value) / 1000);
    introScrubber.setProgress(Number(nurseryRange.value) / 1000);
    syncRange(nurseryRange, Number(nurseryRange.value) / 1000);
  });
  listen(roomRange, 'input', () => {
    roomPlayback.setProgress(Number(roomRange.value) / 1000);
  });
  listen(byId('room-playback'), 'click', () => {
    if (roomPlayback.phase === 'paused') roomPlayback.resume();
    else roomPlayback.pause();
  });
  cards.forEach(card => listen(card, 'click', () => selectRoom(card.dataset.room)));
  roomCards.forEach(card => {
    let pointerPending = false;
    let pointer = null;
    const resetTilt = () => {
      pointer = null;
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    };
    listen(card, 'pointermove', event => {
      if (!finePointer.matches || reduceEffects()) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (pointerPending) return;
      pointerPending = true;
      requestFrame(() => {
        pointerPending = false;
        if (!pointer || reduceEffects()) return;
        const rect = card.getBoundingClientRect();
        const x = Math.max(-0.5, Math.min(0.5, (pointer.x - rect.left) / rect.width - 0.5));
        const y = Math.max(-0.5, Math.min(0.5, (pointer.y - rect.top) / rect.height - 0.5));
        card.style.setProperty('--tilt-x', `${-y * 5}deg`);
        card.style.setProperty('--tilt-y', `${x * 5}deg`);
      });
    });
    listen(card, 'pointerleave', resetTilt);
    listen(card, 'blur', resetTilt);
  });
  listen(byId('change-room'), 'click', () => {
    arrivalGeneration++;
    selecting = false;
    roomPlayback.setActive(false);
    goTo(choices);
    cards.find(card => card.classList.contains('room-card') && card.dataset.room === selected?.id)?.focus({ preventScroll: true });
  });
  listen(byId('replay-room'), 'click', goToWideView);
  listen(byId('nursery-retry'), 'click', () => {
    introScrubber.retry();
    if (storyMode === 'auto') autoStory.resume();
  });
  listen(byId('room-retry'), 'click', () => {
    if (!selected) return;
    byId('room-error').hidden = true;
    byId('room-loading').hidden = false;
    roomWindow.setAttribute('aria-busy', 'true');
    roomPlayback.load(selected.video);
  });
  byId('room-finish').inert = true;
  byId('nursery-loading').hidden = false;
  byId('nursery-window').setAttribute('aria-busy', 'true');
  introScrubber.setProgress(0);
  if (autoplay) autoStory.enable(0);
  syncRange(nurseryRange, 0);
  syncRange(roomRange, 0);
  syncMode();
  return () => {
    disposed = true;
    document.body?.classList.remove('has-journey-mode-control');
    arrivalGeneration++;
    removers.forEach(remove => remove());
    frames.forEach(id => cancelAnimationFrame(id));
    introMotion.reset();
    autoStory.dispose();
    introScrubber.dispose();
    roomPlayback.dispose();
    surface.classList.remove('manual-mode', 'is-autoplay', 'is-scroll-mode', 'is-room-scroll');
  };
}
