# Homepage plant journey

The nursery reveal and Living Room, Bedroom and Office scenes were recovered from version 6 of the original Rastlina room review Site. The source and eight desktop/mobile video files are retained locally in the frontend, so the public storefront does not depend on ChatGPT authentication.

`PlantJourney` renders the original scene markup and mounts its disposable controller after hydration. Styles are scoped to `.plant-journey` to preserve storefront navigation, catalogue and cart styling. The fixed storefront header is accounted for in scene measurements and anchor navigation. Reduced-motion mode uses manual sliders and flat card compositing so room photographs remain visible.

The repaired video controller calls native timers on `globalThis`, catches synchronous loading failures, and offers retry controls after a failed or stalled load. Only the nursery and the selected room load videos; screens up to 700 CSS pixels and data-saving connections select the original smaller mobile versions.

Validation:

- `npm test`: storefront behavior and hydration.
- `npm run test:journey`: loader, seeking, room changes, replay, failure recovery and desktop/mobile scenes, with and without the storefront header offset.
- `npm run build`: production bundle and public homepage prerender.

Original review: https://rastlina-room-review.awarerat128.chatgpt.site/
