import { renderToString } from 'react-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { expect, it } from 'vitest';
import PlantJourney from '@/components/home/PlantJourney';

it('prioritizes the visible nursery poster over hidden chapter posters before JavaScript', () => {
  const context: { helmet?: HelmetServerState } = {};
  HelmetProvider.canUseDOM = false;
  try {
    const html = renderToString(<HelmetProvider context={context}><PlantJourney /></HelmetProvider>);
    expect(context.helmet!.link.toString()).toMatch(/fetchpriority="high"/i);
    const container = document.createElement('div');
    container.innerHTML = html;
    expect(container.querySelector('#story-frame-1 img')).toHaveAttribute('fetchpriority', 'high');
    const hiddenPosters = container.querySelectorAll('.story-frame[aria-hidden="true"] img');
    expect(hiddenPosters).toHaveLength(4);
    for (const poster of hiddenPosters) {
      expect(poster).toHaveAttribute('fetchpriority', 'low');
      expect(poster).toHaveAttribute('loading', 'lazy');
    }
  } finally { HelmetProvider.canUseDOM = true; }
});
