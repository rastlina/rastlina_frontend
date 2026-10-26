# Storefront SEO rendering

The homepage is prerendered separately. Product, article and unknown routes must never use `dist/index.html` as their fallback: that sends the homepage's title, canonical and content on unrelated URLs.

`api/page.ts` renders public product HTML from the current catalogue API. It uses the same editorial and metadata helpers as the React product page. The first stocked variant (or first variant if none are stocked) supplies the initial visible price and Offer. The response is cached at the CDN for 60 seconds; the shopping application fetches current options normally. No account-specific response or customer details are included in the public HTML. Product API outages return 503 with Retry-After, not a false 404.

The build emits `dist/server-shell.html` and `dist/article-data.json`, explicitly included in the Vercel Function. Article images reference emitted public image assets. Article pages include their main content before JavaScript. Valid product and article URLs return 200; unknown products, articles and storefront routes return 404 with noindex. The private routes retain their noindex response headers. Existing assets are served by Vercel's filesystem before the unknown-route fallback.

Historical information routes reported in Search Console redirect to their current equivalents. `/about` has company information and is included in the sitemap. `/3d` redirects to the main homepage. The approved story and room video streams are unchanged. The initial poster has an AVIF option with its original WebP fallback, and the video journey starts after the poster gets a chance to paint.

Catalogue names remain authoritative even when an existing SKU changes cultivar or bundle contents. Editorial rules correct limited spelling errors and supply care guidance; current bundle names determine which plants receive individual care advice. Ambiguous trade names are not assigned invented botanical identities. No room-air-cleaning or guaranteed flowering claim is added. Future, unregistered SKUs retain their supplied copy until reviewed.

Primary references reviewed on 23 October 2026:

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
- https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions
- https://www.rhs.org.uk/plants/calathea/growing-guide
- https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies
- https://www.rhs.org.uk/plants/types/houseplants/how-to-help-a-poorly-houseplant
- https://plants.ces.ncsu.edu/plants/dracaena-trifasciata/
- https://plants.ces.ncsu.edu/plants/adenium-obesum/
- https://plants.ces.ncsu.edu/plants/ledebouria-socialis/
- https://plants.ces.ncsu.edu/plants/chamaedorea-elegans/
- https://plants.ces.ncsu.edu/plants/philodendron/
- https://www.rhs.org.uk/plants/4739/crassula-ovata/details

Run `node build/auditSeo.mjs --output=PATH` after a production build to exercise every current product through the local rendering handler. Add `--live` to verify the published storefront. Reports contain public catalogue metadata only.

The build also runs `build/checkServerRuntime.mjs` without Vite. It verifies emitted Node ESM imports, article rendering and genuine 404s. Shared server imports use explicit `.js` paths, which TypeScript resolves to their source files and Node resolves after compilation.

Search Console's two duplicate examples were Watch & Shop video/product views. These secondary shopping views are deliberately not search landing pages. Their HTTP response now declares `noindex, follow` before JavaScript, matching the browser metadata while allowing discovery of linked product pages. They remain usable and are omitted from the sitemap.

On 26 October, Search Console reported `/shop?category=exotic-beauties` as a canonical conflict. The indexed 25 October version declared `/shop` as its canonical because every collection still received the same static shop shell. `api/collection.ts` now renders the actual filtered product list, category heading, curated introduction and CollectionPage/ItemList schema before JavaScript. It reuses the public catalogue loader, preserves its short price-cache budget and returns 503 for upstream failures.

The existing query-string category links remain canonical. `/shop/:category` aliases, tracking tags and sort variants consolidate to the same query URL, and the Plants alias consolidates to `/shop`. Populated category URLs are included in the sitemap. Search/utility facets and empty valid collections remain navigable with `noindex, follow`; unknown categories return 404. Browser and server metadata share the collection helper. Product-admin descriptions and the current homepage/media work are preserved.
