# Merchant Center product source

`https://www.rastlina.com/merchant-feed.xml` is a public, read-only RSS 2.0 Google product feed. It loads the complete public catalogue (including guarded pagination), then product details with eight concurrent requests and an overall 45-second deadline. Any incomplete refresh returns 503 rather than publishing a partial catalogue. CDN caching subtracts generation time from a one-minute freshness budget and does not serve stale responses on errors.

Each parent product contributes its default purchasable variant: the first stocked variant, otherwise its first variant, otherwise the base product. This matches the landing page's `productSeo`/`defaultProductVariant` selection, including price and availability. Other size/colour variants are not separately advertised with unselected landing pages. The live-data validation on 26 October contained 90 parent products.

The owner's confirmation established that these plant sets currently have internal SKU codes only. SKUs supply stable feed IDs, not fabricated GTINs or MPNs; `identifier_exists=no` reflects that confirmation. If registered manufacturer identifiers are introduced, extend the API/feed mapping accordingly. The feed uses the current product-admin description through the same editorial helper as the website. AI-assisted titles/descriptions use Google's structured attributes and source type. Existing image URLs and metadata are preserved; primary images are selected by the same rule as the landing page. The feed never embeds customer details or private registration addresses.

Configure this as a scheduled file URL for India, English, free listings in Merchant Center 5886632016. The Google sign-in for this work is `info.rastlina@gmail.com`. Merchant Center processing and approval happen after a successful import; an HTTP 200 feed is not approval or proof of rankings.

The shipping, returns and replacement pages are rendered into their initial HTML so Google can read the published policies before JavaScript. Their confirmed terms are ₹99 shipping below ₹499, free shipping from ₹499, Monday–Saturday dispatch, 1–3 handling days plus 5–9 transit days, damaged/incorrect-item claims within 10 days, seller-paid approved return postage and free replacements for completely damaged arrivals. Customer-caused RTO parcels are resent free without refunds. There are no change-of-mind returns or exchanges for non-defective items.

Lake View Towers, Kondapur, Hyderabad, Telangana 500084 remains the public office address. The separate GST-registered address is entered only in Google's registered-address field, not committed to website source.

References:

- https://support.google.com/merchants/answer/7052112
- https://support.google.com/merchants/answer/6324415
- https://support.google.com/merchants/answer/6324468
- https://support.google.com/merchants/answer/14286818
