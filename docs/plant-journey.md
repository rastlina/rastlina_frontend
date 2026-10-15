# Homepage plant journey

The approved story runs in five chapters: nursery approach, roots, the retained pot-exchange bridge joined to planting, self-watering reveal, and the finished planter. The original sources are recorded in `public/journey/assets/story-manifest.json`. Each chapter includes desktop/mobile video and a first-frame poster. Scrolling controls the pinned sequence in both directions and crossfades the right-hand scene between chapters.

Living Room, Bedroom and Office retain the original approved desktop/mobile videos recovered from version 6 of the room review Site. Selecting a room starts natural playback, resets to its first decoded frame, waits five seconds, and plays again. Leaving the view suspends playback; switching rooms cancels the previous replay timer. The source and media are retained locally in the frontend, so the public storefront does not depend on ChatGPT authentication.

`PlantJourney` renders the original scene markup and mounts its disposable controller after hydration. Styles are scoped to `.plant-journey` to preserve storefront navigation, catalogue and cart styling. The fixed storefront header is accounted for in scene measurements and anchor navigation. Page ancestors use horizontal clipping instead of hidden overflow so the stages stick to document scrolling. Reduced-motion mode retains the pinned, directly scroll-controlled video, with no easing, spatial depth or card tilt. Manual sliders remain available, and very short mobile viewports use a stacked layout with manual control.

The repaired video controller calls native timers on `globalThis`, catches synchronous loading failures, and offers retry controls after a failed or stalled load. The current and next story chapters are loaded on demand, along with the selected room; screens up to 700 CSS pixels and data-saving connections select the smaller mobile versions.

Validation:

- `npm test`: storefront behavior and hydration.
- `npm run test:journey`: loader, seeking, room changes, replay, failure recovery and desktop/mobile scenes, with and without the storefront header offset.
- `npm run build`: production bundle and public homepage prerender.

Original review: https://rastlina-room-review.awarerat128.chatgpt.site/
