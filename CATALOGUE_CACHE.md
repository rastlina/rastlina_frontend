# Catalogue speed without a backend deployment

The Vercel catalogue function previously ran in Washington while requests
entered through Mumbai and the data source is in India. `vercel.json` now places
the existing functions in Mumbai (`bom1`). Static files still use the global CDN.

The public catalogue can reuse one ordered feed across collection, room, size,
colour, price and boolean filters through Vercel's Runtime Cache. Each ordering
is fetched from the backend rather than reimplemented. Concurrent requests for
one ordering share the same origin request. The cache lasts at most 60 seconds;
CDN expiry subtracts its existing age and has no stale-while-revalidate extension.

Search remains an upstream query because description text is absent from the
card feed. Authenticated and write requests are rejected by the public endpoint.
Incomplete or paginated feeds retain the original upstream path and metadata.
Cache failures cannot hide the catalogue. Expired content is not an outage
fallback. Product details, cart quotes and checkout keep their existing services.
No images, video quality, mobile controls or backend data are changed.

Validation: 90 app tests pass, including cache expiry, fresh stock/price changes,
outage recovery, shared requests, filtering and public-only access. Production
build, prerender and native Node function checks pass. Fifteen live comparisons
confirmed equal card values and product membership against the original API for
all collections, rooms, size/colour, price filters and multiple sort orders.

Before this change, live office/bedroom/all-plants catalogue cache misses took
3.37s / 1.78s / 2.19s from the local test connection. Response IDs confirmed
`bom1::iad1` routing. Timings vary; verify the new live region and shared-cache
headers and measure again after deployment.

References:
- https://vercel.com/docs/functions/configuring-functions/region
- https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#getcache
