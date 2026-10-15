import { clampProgress } from './media.mjs';

export const STORY_CHAPTERS = Object.freeze([
  { id: 'story-01', label: 'Rooted in care', title: 'Nature.<br><em>Closer to you.</em>', note: 'A living detail. A beautiful everyday.<br>Follow its journey from our nursery to your space.' },
  { id: 'story-02', label: 'Room to grow', title: 'Strong roots.<br><em>A fresh beginning.</em>', note: 'From its nursery pot, a new chapter begins.' },
  { id: 'story-03', label: 'Made for your everyday', title: 'A thoughtful home.<br><em>Ready to grow.</em>', note: 'The nursery pot makes way for a Rastlina planter. The plant settles gently into place.' },
  { id: 'story-04', label: 'Care from within', title: 'Water below.<br><em>Life above.</em>', note: 'Look inside the self-watering planter, from its reservoir to the roots.' },
  { id: 'story-05', label: 'Ready for your space', title: 'A living detail.<br><em>Made for you.</em>', note: 'Your plant, in its complete Rastlina planter. Choose where the story continues.' },
]);

export function storyProgress(scrollProgress) {
  // Complete the last film before the overlapping room choices enter view.
  return clampProgress((clampProgress(scrollProgress) - 0.01) / 0.84);
}

export function storyFrame(progress, count = STORY_CHAPTERS.length) {
  const position = clampProgress(progress) * count;
  const index = Math.min(count - 1, Math.floor(position));
  const local = position - index;
  const t = index === count - 1 ? 0 : clampProgress((local - 0.82) / 0.18);
  return { index, movie: clampProgress(local / 0.8), blend: t * t * (3 - 2 * t) };
}

// Each chapter has its own decoder. Prefetch the next chapter and crossfade
// layers without swapping a playing source or losing reverse-scroll position.
export class StorySequence {
  constructor(layers, { Scrubber, assetBase, mobile, onView = () => {}, onState = () => {} }) {
    this.layers = layers;
    this.onView = onView;
    this.onState = onState;
    this.progress = 0;
    this.entries = layers.map((layer, index) => {
      const entry = { layer, loaded: false, ready: false, failed: false,
        source: `${assetBase}/${STORY_CHAPTERS[index].id}${mobile ? '-mobile' : ''}.mp4` };
      entry.scrubber = new Scrubber(layer.video, {
        onReady: () => { entry.ready = true; layer.element.classList.add('has-video'); this.reportState(); },
        onError: () => { entry.failed = true; layer.element.classList.remove('has-video'); this.reportState(); },
      });
      return entry;
    });
  }
  ensure(index) {
    const entry = this.entries[index];
    if (!entry || entry.loaded) return;
    entry.loaded = true;
    entry.scrubber.load(entry.source);
  }
  setProgress(value) {
    this.progress = clampProgress(value);
    const state = storyFrame(this.progress, this.entries.length);
    this.state = state;
    this.ensure(state.index);
    this.ensure(state.index + 1);
    this.entries.forEach((entry, index) => {
      const opacity = index === state.index ? 1 - state.blend : index === state.index + 1 ? state.blend : 0;
      entry.layer.element.style.setProperty('--frame-opacity', String(opacity));
      entry.layer.element.setAttribute('aria-hidden', String(index !== state.index));
    });
    this.entries[state.index].scrubber.setProgress(state.movie);
    this.entries[state.index + 1]?.scrubber.setProgress(0);
    this.onView({ ...state, chapter: STORY_CHAPTERS[state.index] });
    this.reportState();
  }
  reportState() {
    if (!this.state) return;
    const visible = [this.entries[this.state.index]];
    if (this.state.blend > 0) visible.push(this.entries[this.state.index + 1]);
    this.onState({ failed: visible.some(entry => entry.failed), ready: visible.every(entry => entry.ready) });
  }
  retry() {
    const current = this.state?.index ?? 0;
    for (const index of [current, current + 1]) {
      const entry = this.entries[index];
      if (!entry || !entry.failed) continue;
      entry.failed = entry.ready = false;
      entry.scrubber.load(entry.source);
    }
    this.setProgress(this.progress);
  }
  dispose() { this.entries.forEach(entry => entry.scrubber.dispose()); }
}
