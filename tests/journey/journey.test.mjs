import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// A minimal event/geometry fixture. This tests application behavior, not rendering.
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
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle: (name, force) => {
        const enabled = force ?? !classes.has(name);
        enabled ? classes.add(name) : classes.delete(name);
        return enabled;
      },
    };
    this.style = { setProperty: (name, value) => { this.style[name] = value; } };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getBoundingClientRect() { return { top: (this.absoluteTop || 0) - globalThis.scrollY }; }
  querySelector(selector) { if (selector === '.chapter-stage') return { offsetHeight: 1000 }; throw new Error(selector); }
  focus() { globalThis.document.activeElement = this; }
}

class Video extends Element {
  constructor(attrs) {
    super('video', attrs);
    Object.assign(this, { src: '', currentSrc: '', readyState: 0, duration: NaN, seeking: false, time: 0, seeks: [], loads: [], pauses: 0 });
  }
  get currentTime() { return this.time; }
  set currentTime(value) { this.time = value; this.seeks.push(value); this.seeking = true; }
  pause() { this.pauses++; }
  load() {
    this.loads.push(this.src);
    this.currentSrc = '';
    this.readyState = 0;
    this.seeking = false;
    this.time = 0;
  }
  decoded(duration = 10.041667) {
    this.currentSrc = this.src;
    this.duration = duration;
    this.readyState = 1;
    this.dispatchEvent(new Event('loadedmetadata'));
    this.readyState = 2;
    this.dispatchEvent(new Event('loadeddata'));
  }
  completeSeek() { this.seeking = false; this.dispatchEvent(new Event('seeked')); }
}

for (const [mobile, scrollOffset] of [[false, 0], [true, 0], [false, 110], [true, 110]]) test(`the ${mobile ? 'mobile' : 'desktop'} journey loads all rooms, scrubs, replays and recovers with ${scrollOffset}px header offset`, async () => {
  const html = await readFile(new URL('../../src/components/home/journey/markup.html', import.meta.url), 'utf8');
  const nodes = new Map();
  const cards = [];
  for (const [, tag, rawAttrs] of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)) {
    const attrs = Object.fromEntries([...rawAttrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
    const node = tag === 'video' ? new Video(attrs) : new Element(tag, attrs);
    node.hidden = /(?:^|\s)hidden(?:\s|$)/.test(rawAttrs);
    if (attrs.id) nodes.set(attrs.id, node);
    if (attrs['data-room']) cards.push(node);
  }
  const get = id => { assert.ok(nodes.has(id), `Missing DOM element ${id}`); return nodes.get(id); };
  get('nursery-story').offsetHeight = 2500;
  get('nursery-story').absoluteTop = scrollOffset;
  get('room-story').offsetHeight = 3600;
  get('room-story').absoluteTop = 4500 + scrollOffset;
  get('room-choices').absoluteTop = 2500 + scrollOffset;
  const media = new Map();
  const callbacks = [];
  const globals = ['document', 'window', 'matchMedia', 'requestAnimationFrame', 'scrollY'];
  const previous = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    globalThis.scrollY = 0;
    globalThis.document = {
      getElementById: get,
      querySelectorAll: selector => { assert.equal(selector, '[data-room]'); return cards; },
      documentElement: new Element('html'), activeElement: null,
    };
    globalThis.window = new EventTarget();
    window.scrollTo = ({ top }) => { globalThis.scrollY = top; window.dispatchEvent(new Event('scroll')); };
    globalThis.matchMedia = query => {
      if (!media.has(query)) media.set(query, Object.assign(new EventTarget(), { matches: mobile && query === '(max-width: 700px)' }));
      return media.get(query);
    };
    globalThis.requestAnimationFrame = callback => callbacks.push(callback);
    let frameTime = 0;
    const drain = () => {
      let remaining = 90;
      while (callbacks.length && remaining--) { frameTime += 1000 / 60; callbacks.shift()(frameTime); }
      assert.equal(callbacks.length, 0, 'Navigation should settle without an animation loop');
    };
    const click = node => { node.dispatchEvent(new Event('click')); drain(); };
    const input = (id, value) => { get(id).value = String(value); get(id).dispatchEvent(new Event('input')); };
    const scroll = top => {
      window.dispatchEvent(new Event('wheel'));
      window.scrollTo({ top });
      drain();
    };
    const { mountJourney } = await import(`../../src/components/home/journey/controller.mjs?journey=${Date.now()}`);
    mountJourney(document, { scrollOffset });
    drain();
    const nursery = get('nursery-video');
    const room = get('room-video');
    assert.equal(nursery.loads.length, 1);
    assert.equal(room.loads.length, 0, 'No room downloads before a choice');
    assert.equal(get('room-story').hidden, true);
    const suffix = mobile ? '-mobile-v5' : '-v4';
    assert.ok(nursery.src.endsWith(`/assets/nursery${suffix}.mp4`));
    nursery.decoded(5.041667);
    assert.equal(get('nursery-loading').hidden, true);
    assert.equal(get('nursery-window').classList.contains('has-video'), true);
    input('nursery-range', 500);
    nursery.completeSeek();
    assert.equal(nursery.currentTime, 2.5);
    scroll(1500 * 0.6);
    nursery.completeSeek();
    nursery.completeSeek();
    assert.equal(nursery.currentTime, 5, 'Nursery scrolling must reach its final frame');
    scroll(0);
    nursery.completeSeek();
    nursery.completeSeek();
    assert.equal(nursery.currentTime, 0, 'Nursery reverse scrolling must return to its start');
    nursery.dispatchEvent(new Event('error'));
    assert.equal(get('nursery-loading').hidden, true);
    assert.equal(get('nursery-error').hidden, false);
    click(get('nursery-retry'));
    nursery.decoded(5.041667);
    assert.equal(get('nursery-error').hidden, true);

    click(cards.find(card => card.dataset.room === 'bedroom'));
    assert.equal(get('room-story').hidden, false);
    assert.equal(get('room-heading').textContent, 'A quiet retreat.');
    assert.equal(document.activeElement, get('room-heading'));
    assert.equal(room.loads.length, 1);
    assert.ok(room.src.endsWith(`/assets/bedroom${suffix}.mp4`));
    assert.equal(cards.filter(card => card.attributes['aria-pressed'] === 'true').length, 2);
    room.decoded();
    assert.equal(get('room-loading').hidden, true);

    scroll(4500 + 2600 * 0.9);
    room.completeSeek(); // The queued latest target follows the first eased seek.
    assert.equal(room.currentTime, 10);
    assert.equal(get('room-finish').inert, true, 'Do not offer the ending before decoding');
    room.completeSeek();
    assert.equal(get('room-finish').inert, false);
    assert.equal(get('room-finish').classList.contains('visible'), true);
    click(get('replay-room'));
    room.completeSeek();
    assert.equal(room.currentTime, 0, 'Replay returns to the wide starting view');
    assert.equal(get('room-finish').inert, true);
    input('room-range', 500);
    assert.equal(room.currentTime, 5);
    assert.equal(get('room-finish').inert, true);
    assert.equal(get('room-range').attributes['aria-valuetext'], '50% through the view');
    room.completeSeek();

    click(cards.find(card => card.dataset.room === 'office' && !card.classList.contains('room-card')));
    assert.equal(room.currentTime, 0);
    assert.ok(room.src.endsWith(`/assets/office${suffix}.mp4`));
    assert.equal(room.loads.length, 2);
    assert.equal(get('room-poster').src, 'assets/office-start.webp');
    room.decoded();
    input('room-range', 650);
    room.dispatchEvent(new Event('error'));
    assert.equal(get('room-error').hidden, false);
    assert.equal(get('room-window').classList.contains('has-video'), false);
    click(get('room-retry'));
    room.decoded();
    room.completeSeek();
    assert.equal(room.currentTime, 6.5, 'Retry should preserve the requested position');
    assert.equal(get('room-error').hidden, true);
    assert.equal(get('room-window').classList.contains('has-video'), true);

    const reduced = media.get('(prefers-reduced-motion: reduce)');
    reduced.matches = true;
    reduced.dispatchEvent(new Event('change'));
    drain();
    assert.equal(document.documentElement.classList.contains('manual-mode'), true);
    assert.equal(get('room-story').style['--scene-z'], '0px');
    assert.equal(get('room-story').style['--copy-opacity'], '1');
    assert.ok(cards.filter(card => card.classList.contains('room-card')).every(card => card.style['--card-z'] === '0px'));
    scroll(6500);
    assert.equal(room.currentTime, 6.5, 'Reduced-motion scrolling should not seek');
    input('room-range', 250);
    room.completeSeek();
    assert.equal(room.currentTime, 2.5);

    click(get('change-room'));
    assert.equal(document.activeElement.dataset.room, 'office');
    assert.equal(document.activeElement.classList.contains('room-card'), true);
    click(cards.find(card => card.dataset.room === 'living-room'));
    room.decoded();
    assert.ok(room.src.endsWith(`/assets/living-room${suffix}.mp4`));
    assert.equal(room.currentTime, 0);
    assert.equal(room.loads.length, 4, 'Three chosen rooms plus one retry');
    input('room-range', 750);
    room.completeSeek();
    assert.equal(room.currentTime, 7.5, 'Living Room supports scrubbing too');
    click(get('replay-room'));
    room.completeSeek();
    assert.equal(room.currentTime, 0);

    reduced.matches = false;
    const compact = media.get('(max-width: 620px) and (max-height: 520px)');
    compact.matches = true;
    compact.dispatchEvent(new Event('change'));
    drain();
    scroll(6500);
    assert.equal(room.currentTime, 0, 'A short portrait viewport should retain manual control');
    nursery.completeSeek();
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
