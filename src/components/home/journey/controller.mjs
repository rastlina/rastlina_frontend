export const ROOMS = Object.freeze({
  'living-room': { name: 'Living Room', heading: 'A warm welcome.', note: 'A little green, in your living room.' },
  bedroom: { name: 'Bedroom', heading: 'A quiet retreat.', note: 'A little green, beside your everyday moments.' },
  office: { name: 'Office', heading: 'Room to focus.', note: 'A little green, at your desk.' },
});

export function clampProgress(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

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

export function sceneDepth(movieProgress, scrollProgress, nursery = false, manual = false) {
  if (manual) return { copyOpacity: 1, copyY: 0, copyZ: 0, sceneZ: 0, ambienceY: 0 };
  const departure = smoothProgress(clampProgress(movieProgress) / 0.22);
  const retreat = nursery
    ? smoothProgress((clampProgress(scrollProgress) - 0.6) / 0.4)
    : smoothProgress((clampProgress(scrollProgress) - 0.94) / 0.06);
  return {
    copyOpacity: 1 - departure,
    copyY: -56 * departure,
    copyZ: -180 * departure,
    sceneZ: -(nursery ? 96 : 36) * retreat,
    ambienceY: -24 * clampProgress(scrollProgress),
  };
}

export function choiceDepth(top, viewportHeight, index, manual = false) {
  if (manual) return { y: 0, z: 0, turn: 0, opacity: 1 };
  const entry = clampProgress(1 - top / Math.max(1, viewportHeight));
  const reveal = smoothProgress(entry * 1.4 - index * 0.15);
  return { y: 72 * (1 - reveal), z: -96 * (1 - reveal), turn: (1 - index) * 6 * (1 - reveal), opacity: 0.6 + 0.4 * reveal };
}

export function finalFrameTime(duration, fps = 24) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, (Math.floor(duration * fps + 0.001) - 1) / fps);
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
  setTarget(value) {
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
    this.listen('play', () => video.pause());
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
    if (this.failed || !this.source || !this.isCurrentSource() || video.readyState < 1 || video.seeking) return;
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

export function mountJourney(root = document, { assetBase = 'assets', scrollOffset = 0 } = {}) {
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
  const mobileMedia = matchMedia('(max-width: 700px)').matches || Boolean(globalThis.navigator?.connection?.saveData);
  const nurserySource = `${assetBase}/nursery${mobileMedia ? '-mobile-v5' : '-v4'}.mp4`;
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
  let framePending = false;
  let introManual = false;
  let roomManual = false;
  let scrollIntent = false;
  let selecting = false;
  let arrivalGeneration = 0;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  function manualMode() { return reducedMotion.matches || compactViewport.matches; }
  function syncMode() {
    surface.classList.toggle('manual-mode', manualMode());
    if (manualMode()) {
      introMotion.reset(introScrubber.progress);
      roomMotion.reset(roomScrubber.progress);
    }
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
    const state = sceneDepth(movieProgress, rawProgress, nursery, manualMode());
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
      const state = choiceDepth(top, height, index, manualMode());
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
    const complete = progress >= 0.985 && roomScrubber.progress >= 0.985;
    byId('orbit-readout').textContent = `${String(Math.round(progress * 100)).padStart(2, '0')} / 100`;
    byId('room-finish').classList.toggle('visible', complete);
    byId('room-finish').inert = !complete;
  }

  const introScrubber = new VideoScrubber(byId('nursery-video'), {
    onReady: () => { byId('nursery-window').classList.add('has-video'); byId('nursery-window').setAttribute('aria-busy', 'false'); byId('nursery-loading').hidden = true; },
    onError: () => showError('nursery-window', 'nursery-loading', 'nursery-error'),
  });
  const roomScrubber = new VideoScrubber(byId('room-video'), {
    onReady: () => { roomWindow.classList.add('has-video'); roomWindow.setAttribute('aria-busy', 'false'); byId('room-loading').hidden = true; },
    onError: () => { showError('room-window', 'room-loading', 'room-error'); updateRoomFinish(0); },
    onFrame: updateRoomFinish,
  });

  const introMotion = new ProgressSmoother(progress => {
    introScrubber.setProgress(progress);
    syncRange(nurseryRange, progress);
    applyDepth(introSection, progress, measuredProgress(introSection), true);
  }, { requestFrame });
  const roomMotion = new ProgressSmoother(setRoomProgress, { requestFrame });

  function measuredProgress(section) {
    return sectionProgress(section.getBoundingClientRect().top - scrollOffset, section.offsetHeight, section.querySelector('.chapter-stage').offsetHeight);
  }
  function setRoomProgress(progress) {
    roomScrubber.setProgress(progress);
    syncRange(roomRange, progress);
    if (progress < 0.985) updateRoomFinish(0);
    applyDepth(roomSection, progress, selecting ? 0 : measuredProgress(roomSection));
  }
  function renderScroll() {
    framePending = false;
    const introPosition = measuredProgress(introSection);
    if (!manualMode() && !introManual) {
      const progress = nurseryProgress(introPosition);
      introMotion.setTarget(progress);
    }
    applyDepth(introSection, introScrubber.progress, introPosition, true);
    if (selected && !selecting && !manualMode() && !roomManual) roomMotion.setTarget(cinematicProgress(measuredProgress(roomSection)));
    else if (selected) applyDepth(roomSection, roomScrubber.progress, selecting ? 0 : measuredProgress(roomSection));
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
    roomManual = false;
    roomMotion.reset(0);
    setRoomProgress(0);
    goTo(roomSection);
    // Keep the wide frame while navigating, including after a quick room change.
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
    byId('room-video').setAttribute('aria-label', `${selection.name} camera orbit, controlled by scrolling`);
    byId('room-heading').textContent = selection.heading;
    byId('room-eyebrow').textContent = selection.note;
    byId('room-label').textContent = selection.name;
    roomRange.setAttribute('aria-label', `Explore the ${selection.name.toLowerCase()} view`);
    cards.forEach(card => card.setAttribute('aria-pressed', String(card.dataset.room === id)));
    byId('selection-status').textContent = `${selection.name} selected. Scroll or use Explore the view to move around your plant.`;
    byId('orbit-readout').textContent = '00 / 100';
    roomScrubber.load(selection.video);
    goToWideView();
    byId('room-heading').focus({ preventScroll: true });
  }

  function noteScrollIntent(event) {
    if (event.type === 'keydown' && !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
    if (event.type === 'keydown' && /^(INPUT|BUTTON|A)$/.test(document.activeElement?.tagName || '')) return;
    scrollIntent = true;
    if (selecting) { arrivalGeneration++; selecting = false; }
    introManual = false;
    roomManual = false;
  }
  listen(window, 'wheel', noteScrollIntent, { passive: true });
  listen(window, 'touchstart', noteScrollIntent, { passive: true });
  listen(window, 'keydown', noteScrollIntent);
  listen(window, 'scroll', () => {
    if (scrollIntent) { introManual = false; roomManual = false; }
    schedule();
  }, { passive: true });
  listen(window, 'resize', schedule, { passive: true });
  listen(reducedMotion, 'change', syncMode);
  listen(compactViewport, 'change', syncMode);
  listen(window, 'pageshow', schedule);
  listen(window, 'pagehide', () => {
    introMotion.reset(introScrubber.progress);
    roomMotion.reset(roomScrubber.progress);
  });

  listen(nurseryRange, 'input', () => {
    scrollIntent = false;
    introManual = true;
    introMotion.reset(Number(nurseryRange.value) / 1000);
    introScrubber.setProgress(Number(nurseryRange.value) / 1000);
    syncRange(nurseryRange, Number(nurseryRange.value) / 1000);
    applyDepth(introSection, introScrubber.progress, measuredProgress(introSection), true);
  });
  listen(roomRange, 'input', () => {
    scrollIntent = false;
    roomManual = true;
    roomMotion.reset(Number(roomRange.value) / 1000);
    setRoomProgress(Number(roomRange.value) / 1000);
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
      if (!finePointer.matches || manualMode()) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (pointerPending) return;
      pointerPending = true;
      requestFrame(() => {
        pointerPending = false;
        if (!pointer || manualMode()) return;
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
    goTo(choices);
    cards.find(card => card.classList.contains('room-card') && card.dataset.room === selected?.id)?.focus({ preventScroll: true });
  });
  listen(byId('replay-room'), 'click', goToWideView);
  listen(byId('nursery-retry'), 'click', () => {
    const progress = introScrubber.progress;
    byId('nursery-error').hidden = true;
    byId('nursery-loading').hidden = false;
    byId('nursery-window').setAttribute('aria-busy', 'true');
    introScrubber.load(nurserySource);
    introScrubber.setProgress(progress);
  });
  listen(byId('room-retry'), 'click', () => {
    if (!selected) return;
    const progress = roomScrubber.progress;
    byId('room-error').hidden = true;
    byId('room-loading').hidden = false;
    roomWindow.setAttribute('aria-busy', 'true');
    roomScrubber.load(selected.video);
    roomScrubber.setProgress(progress);
  });
  byId('room-finish').inert = true;
  byId('nursery-loading').hidden = false;
  byId('nursery-window').setAttribute('aria-busy', 'true');
  introScrubber.load(nurserySource);
  syncRange(nurseryRange, 0);
  syncRange(roomRange, 0);
  syncMode();
  return () => {
    disposed = true;
    arrivalGeneration++;
    removers.forEach(remove => remove());
    frames.forEach(id => cancelAnimationFrame(id));
    introMotion.reset();
    roomMotion.reset();
    introScrubber.dispose();
    roomScrubber.dispose();
    surface.classList.remove('manual-mode');
  };
}
