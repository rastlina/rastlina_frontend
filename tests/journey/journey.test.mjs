import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mountJourney } from '../../src/components/home/journey/controller.mjs';

// Event and media-clock fixture for the real markup/controller. Actual sticky
// positioning and video decoding are verified separately in a browser.
class Element extends EventTarget {
  constructor(tag, attrs = {}) {
    super();
    this.tagName = tag.toUpperCase();
    this.attributes = { ...attrs };
    this.dataset = Object.fromEntries(Object.entries(attrs).filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5), value]));
    this.value = attrs.value || '';
    this.hidden = false;
    this.textContent = '';
    this.offsetHeight = 32;
    const classes = new Set((attrs.class || '').split(' ').filter(Boolean));
    this.classList = {
      add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name),
      toggle: (name, force) => { const enabled = force ?? !classes.has(name); enabled ? classes.add(name) : classes.delete(name); return enabled; },
    };
    this.style = { setProperty: (name, value) => { this.style[name] = value; } };
  }
  append(child) { this.textContent += child.textContent; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; if (name === 'src') this.src = ''; }
  getBoundingClientRect() { return { top: (this.absoluteTop || 0) - globalThis.scrollY }; }
  querySelector(selector) { if (selector === '.chapter-stage') return { offsetHeight: 1000 }; throw new Error(selector); }
  focus() { globalThis.document.activeElement = this; }
}

class Video extends Element {
  constructor(attrs) {
    super('video', attrs);
    Object.assign(this, { src: '', currentSrc: '', readyState: 0, duration: NaN, seeking: false,
      paused: true, time: 0, seeks: [], loads: [], plays: [], pauses: 0 });
  }
  get currentTime() { return this.time; }
  set currentTime(value) { this.time = value; this.seeks.push(value); this.seeking = true; }
  pause() { this.pauses++; this.paused = true; }
  play() { this.plays.push({ source: this.src, time: this.time }); this.paused = false; return Promise.resolve(); }
  load() { this.loads.push(this.src); this.currentSrc = ''; this.readyState = 0; this.seeking = false; this.time = 0; this.paused = true; }
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
}

for (const reducedMotion of [false, true])
for (const [mobile, scrollOffset] of [[false, 0], [true, 0], [false, 110], [true, 110]])
test(`five story chapters and automatic rooms: ${mobile ? 'mobile' : 'desktop'}, offset ${scrollOffset}, reduced motion ${reducedMotion}`, async () => {
  const html = await readFile(new URL('../../src/components/home/journey/markup.html', import.meta.url), 'utf8');
  const nodes = new Map(), cards = [], videos = [];
  for (const [, tag, rawAttrs] of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)) {
    const attrs = Object.fromEntries([...rawAttrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
    const node = tag === 'video' ? new Video(attrs) : new Element(tag, attrs);
    node.hidden = /(?:^|\s)hidden(?:\s|$)/.test(rawAttrs);
    if (attrs.id) nodes.set(attrs.id, node);
    if (attrs['data-room']) cards.push(node);
    if (tag === 'video') videos.push(node);
  }
  const get = id => { assert.ok(nodes.has(id), `Missing DOM element ${id}`); return nodes.get(id); };
  const chapters = ['nursery-video', 'story-video-2', 'story-video-3', 'story-video-4', 'story-video-5'].map(get);
  const stage = get('nursery-story'), roomStage = get('room-story'), room = get('room-video');
  stage.offsetHeight = 10000;
  stage.absoluteTop = scrollOffset;
  roomStage.offsetHeight = 1000;
  roomStage.absoluteTop = 11500 + scrollOffset;
  get('room-choices').absoluteTop = 10000 + scrollOffset;
  const media = new Map(), callbacks = new Map();
  let nextFrame = 0, frameTime = 0, dispose;
  const globals = ['document', 'window', 'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame', 'scrollY'];
  const previous = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    globalThis.scrollY = 0;
    globalThis.document = Object.assign(new EventTarget(), {
      getElementById: get,
      createElement: tag => new Element(tag),
      querySelectorAll: selector => { assert.equal(selector, '[data-room]'); return cards; },
      documentElement: Object.assign(new Element('html'), { scrollHeight: 15000 }), activeElement: null, hidden: false,
    });
    globalThis.window = Object.assign(new EventTarget(), { innerHeight: 1000 + scrollOffset });
    window.scrollTo = ({ top }) => { globalThis.scrollY = top; window.dispatchEvent(new Event('scroll')); };
    globalThis.matchMedia = query => {
      if (!media.has(query)) media.set(query, Object.assign(new EventTarget(), { matches:
        (mobile && query === '(max-width: 700px)') || (reducedMotion && query === '(prefers-reduced-motion: reduce)') }));
      return media.get(query);
    };
    globalThis.requestAnimationFrame = callback => { callbacks.set(++nextFrame, callback); return nextFrame; };
    globalThis.cancelAnimationFrame = id => callbacks.delete(id);
    const drain = () => {
      let remaining = 120;
      while (callbacks.size && remaining--) {
        const [id, callback] = callbacks.entries().next().value;
        callbacks.delete(id); frameTime += 1000 / 60; callback(frameTime);
      }
      assert.equal(callbacks.size, 0, 'Scroll and navigation must settle without an idle animation loop');
    };
    const settleMedia = async () => {
      for (const video of videos) {
        if (video.src && !video.currentSrc) video.decoded();
        for (let attempt = 0; video.seeking && attempt < 4; attempt++) video.completeSeek();
        assert.equal(video.seeking, false, 'The latest requested media frame should settle');
      }
      await Promise.resolve();
    };
    const click = async node => { node.dispatchEvent(new Event('click')); drain(); await settleMedia(); };
    const input = async (id, value) => { get(id).value = String(value); get(id).dispatchEvent(new Event('input')); drain(); await settleMedia(); };
    const scroll = async top => {
      window.dispatchEvent(new Event('wheel')); window.scrollTo({ top }); drain(); await settleMedia();
    };
    const scrollStory = progress => scroll(9000 * (0.01 + 0.84 * progress));
    const near = (actual, expected, message) => assert.ok(Math.abs(Number(actual) - expected) < 0.002, `${message}: ${actual} should be ${expected}`);

    dispose = mountJourney(document, { scrollOffset, autoplay: false });
    drain();
    assert.equal(document.documentElement.classList.contains('manual-mode'), false, 'Reduced motion retains the pinned story');
    assert.deepEqual(chapters.map(video => video.loads.length), [1, 1, 0, 0, 0], 'Only the current and next chapter preload');
    assert.equal(room.loads.length, 0, 'Room media waits for a selection');
    assert.equal(roomStage.hidden, true);
    assert.equal(get('nursery-window').attributes['aria-busy'], 'true');
    await settleMedia();
    assert.equal(get('nursery-loading').hidden, true);
    assert.equal(get('story-frame-1').classList.contains('has-video'), true);
    assert.equal(get('story-position').textContent, '1 / 5');
    const chapterSuffix = mobile ? '-mobile' : '';
    assert.ok(chapters[0].src.endsWith(`/assets/story-01${chapterSuffix}.mp4`));

    const firstSeeks = chapters[0].seeks.length;
    await scrollStory(0.08);
    assert.equal(chapters[0].currentTime, 5, 'Actual document scroll advances the first chapter');
    if (reducedMotion) assert.equal(chapters[0].seeks.length, firstSeeks + 1, 'Reduced motion seeks directly without easing');
    await scrollStory(0.182);
    near(get('story-frame-1').style['--frame-opacity'], 0.5, 'Outgoing frame fades');
    near(get('story-frame-2').style['--frame-opacity'], 0.5, 'Next frame appears in the crossfade');
    assert.equal(chapters[0].currentTime, 10);
    assert.equal(chapters[1].currentTime, 0, 'The incoming chapter begins on its wide frame');
    if (!reducedMotion) {
      const currentY = parseFloat(get('story-copy-current').style['--text-y']);
      const nextY = parseFloat(get('story-copy-next').style['--text-y']);
      assert.ok(currentY < 0, 'The current title travels upward with document scrolling');
      assert.ok(nextY > 0, 'The next title enters from below');
      assert.equal(get('story-copy-next').style.visibility, 'visible');
    } else {
      assert.equal(get('story-copy-current').style['--text-y'], '0px');
      assert.equal(get('story-copy-next').style.visibility, 'hidden', 'Reduced motion keeps one stationary readable title');
    }


    const labels = ['Rooted in care', 'Room to grow', 'Made for your everyday', 'Care from within', 'Ready for your space'];
    for (let index = 0; index < chapters.length; index++) {
      await scrollStory((index + 0.4) / 5);
      assert.equal(get('story-position').textContent, `${index + 1} / 5`);
      assert.equal(get('story-eyebrow').textContent, labels[index]);
      assert.equal(chapters[index].currentTime, 5, `Chapter ${index + 1} follows scroll progress`);
      assert.equal(get(`story-frame-${index + 1}`).attributes['aria-hidden'], 'false');
      assert.ok(chapters[index].src.endsWith(`/assets/story-0${index + 1}${chapterSuffix}.mp4`));
      assert.equal(parseFloat(get('story-copy-current').style['--text-y']), 0, 'Each title rests in full view for reading');
      if (!reducedMotion && index < chapters.length - 1) {
        await scrollStory((index + 0.91) / 5);
        const outgoingY = parseFloat(get('story-copy-current').style['--text-y']);
        const enteringY = parseFloat(get('story-copy-next').style['--text-y']);
        assert.ok(outgoingY < 0 && enteringY > 0, `Chapter ${index + 1} has a vertical text handoff`);
        const arrivingTitle = get('next-story-heading').innerHTML;
        await scrollStory((index + 1.001) / 5);
        assert.equal(get('nursery-heading').innerHTML, arrivingTitle, 'The entering title becomes current at its resting position');
        await scrollStory((index + 0.91) / 5);
        near(parseFloat(get('story-copy-current').style['--text-y']), outgoingY, 'Reverse scroll restores exactly the same title position');
      }

    }
    await scrollStory(1);
    assert.equal(chapters[4].currentTime, 10, 'The full journey reaches the final planter frame');
    assert.equal(get('nursery-range').value, '1000');
    assert.equal(get('nursery-range').attributes['aria-valuetext'], 'The complete planter');
    await scrollStory(0.182);
    near(get('story-frame-1').style['--frame-opacity'], 0.5, 'The same crossfade reverses with scrolling');
    await scroll(0);
    assert.equal(chapters[0].currentTime, 0);
    assert.equal(get('story-position').textContent, '1 / 5');

    await input('nursery-range', 480);
    assert.equal(get('story-position').textContent, '3 / 5', 'The accessible slider spans all chapters');
    assert.equal(chapters[2].currentTime, 5);
    chapters[2].dispatchEvent(new Event('error'));
    assert.equal(get('nursery-error').hidden, false);
    assert.equal(get('nursery-loading').hidden, true);
    const failedChapterLoads = chapters[2].loads.length;
    await click(get('nursery-retry'));
    assert.equal(chapters[2].loads.length, failedChapterLoads + 1);
    assert.equal(chapters[2].currentTime, 5, 'Retry preserves the requested chapter and frame');
    assert.equal(get('nursery-error').hidden, true);
    await scroll(0);
    assert.equal(get('story-position').textContent, '1 / 5', 'Scrolling retakes control after using the slider');

    const roomSuffix = mobile ? '-mobile-v5' : '-v4';
    for (const [id, heading] of [['bedroom', 'Rest easy. Breathe green.'], ['office', 'Fresh thinking. Naturally.'], ['living-room', 'Your space. More alive.']]) {
      const choice = cards.find(card => card.dataset.room === id && (id === 'office' ? !card.classList.contains('room-card') : card.classList.contains('room-card')));
      const plays = room.plays.length;
      await click(choice);
      assert.equal(roomStage.hidden, false);
      assert.equal(get('room-heading').textContent, heading);
      assert.equal(document.activeElement, get('room-heading'));
      assert.equal(globalThis.scrollY, 11500, 'Room navigation accounts for the storefront header');
      assert.ok(room.src.endsWith(`/assets/${id}${roomSuffix}.mp4`));
      assert.equal(get('room-poster').src, `assets/${id}-start.webp`);
      assert.equal(cards.filter(card => card.attributes['aria-pressed'] === 'true').length, 2);
      assert.equal(room.plays.length, plays + 1, 'Every selection automatically plays its own film');
      assert.equal(room.currentTime, 0);
      assert.equal(room.paused, false);
      assert.equal(room.muted, true);
      assert.equal(room.playsInline, true);
      assert.equal(get('room-playback').textContent, 'Pause animation');
      assert.match(get('selection-status').textContent, /plays automatically/);
      room.advance(4);
      assert.equal(get('room-range').value, '400');
      assert.equal(get('orbit-readout').textContent, '40 / 100');
      const seeks = room.seeks.length;
      await scroll(11600);
      assert.equal(room.currentTime, 4, 'Scrolling must not fight natural room playback');
      assert.equal(room.seeks.length, seeks);
      await click(get('room-playback'));
      assert.equal(room.paused, true);
      assert.equal(get('room-playback').textContent, 'Play animation');
      await input('room-range', 650);
      assert.equal(room.currentTime, 6.5);
      assert.equal(room.paused, true, 'Manual scrubbing pauses playback');
      assert.equal(get('room-range').attributes['aria-valuetext'], '65% through the view');
      await click(get('room-playback'));
      assert.equal(room.paused, false);
      assert.equal(room.plays.at(-1).time, 6.5, 'Play resumes the manual position');
      room.advance(10);
      assert.equal(get('room-finish').inert, false);
      await click(get('replay-room'));
      assert.equal(room.currentTime, 0);
      assert.equal(room.paused, false);
      assert.equal(get('room-finish').inert, true);
    }

    room.dispatchEvent(new Event('error'));
    assert.equal(get('room-error').hidden, false);
    assert.equal(get('room-window').classList.contains('has-video'), false);
    const roomLoads = room.loads.length;
    await click(get('room-retry'));
    assert.equal(room.loads.length, roomLoads + 1);
    assert.equal(room.currentTime, 0, 'Retry begins a fresh automatic room cycle');
    assert.equal(room.paused, false);
    assert.equal(get('room-error').hidden, true);

    document.hidden = true;
    document.dispatchEvent(new Event('visibilitychange')); drain();
    assert.equal(room.paused, true);
    document.hidden = false;
    document.dispatchEvent(new Event('visibilitychange')); drain(); await Promise.resolve();
    assert.equal(room.paused, false);
    await click(get('change-room'));
    assert.equal(document.activeElement.dataset.room, 'living-room');
    assert.equal(document.activeElement.classList.contains('room-card'), true);
    assert.equal(room.paused, true, 'Leaving the room suspends its automatic animation');

    const compact = media.get('(max-width: 620px) and (max-height: 520px)');
    compact.matches = true; compact.dispatchEvent(new Event('change')); drain();
    assert.equal(document.documentElement.classList.contains('manual-mode'), true);
    await input('nursery-range', 480);
    await scroll(0);
    assert.equal(get('story-position').textContent, '3 / 5', 'Compact viewports keep the manual story position');
    assert.equal(chapters[2].currentTime, 5);
    await input('nursery-range', 880);
    assert.equal(get('story-position').textContent, '5 / 5');
    compact.matches = false; compact.dispatchEvent(new Event('change')); drain(); await settleMedia();
    await scroll(0);
    assert.equal(document.documentElement.classList.contains('manual-mode'), false);
    assert.equal(get('story-position').textContent, '1 / 5');
  } finally {
    dispose?.();
    assert.equal(callbacks.size, 0, 'Unmount cancels pending animation frames');
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
