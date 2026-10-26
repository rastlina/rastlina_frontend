import { canonicalUrl } from './seoUrls.js';

export const collectionFilters = new Set(['main_category', 'category', 'space', 'size', 'color', 'search', 'ordering', 'care_level', 'pet_friendly', 'air_purifying', 'min_price', 'max_price', 'is_new_arrival', 'is_best_seller', 'is_best_deal', 'is_trending']);

const introductions: Record<string, string> = {
  'exotic-beauties': 'Explore unusual foliage and distinctive plant forms in Rastlina’s Exotic Plants collection. Compare the individual light and watering needs before choosing a plant for your space.',
  aglaonema: 'Compare the colours and leaf patterns in Rastlina’s Aglaonema collection. Check each listing for its named variety, size and care guidance.',
  calathea: 'Discover patterned foliage in Rastlina’s Calathea collection. Read the individual plant guides and choose a position suited to the variety you select.',
  'money-plant': 'Browse Rastlina’s named money-plant selections and compare their foliage, sizes and care requirements. Check the current listing for the variety included.',
  philodendron: 'Explore Rastlina’s Philodendron selections, from colourful foliage to distinctive leaf shapes. Compare the named varieties and their growing requirements.',
  syngonium: 'Browse the current Syngonium collection and compare the named foliage selections. Availability and the individual care requirements are shown on each product page.',
  'combos-of-2': 'Choose a two-plant combo for a paired display or living gift. Check the exact plants listed in each set and care for each pot according to its own needs.',
  'combos-of-3': 'Compare three-plant combos for a varied foliage display or a living gift. Each product listing identifies the current set and the plants included.',
  'combos-of-4': 'Discover four-plant combos for a coordinated living gift or plant collection. Review the current members of each set and choose suitable positions for all four plants.',
  'best-sellers': 'Browse the products currently included in Rastlina’s Best-Selling Plants collection. Compare plant sizes, current prices and care requirements before choosing.',
  'favourite-collection': 'Explore Rastlina Favourites and choose a plant that suits your space. Compare the current selections and read their individual care instructions.',
  'fast-grown': 'Browse the Fast-Growing Plants collection and check each plant’s individual growing needs. Growth varies with light, temperature, care and season.',
  'air-purifying-plants': 'Browse this named foliage collection and compare the plants by their appearance and growing requirements. Choose a position using each product’s light and watering guide.',
};

export function collectionSeo(path: string, heading: string, empty = false) {
  const url = new URL(path, 'https://www.rastlina.com');
  const alias = url.pathname.match(/^\/shop\/([^/]+)\/?$/)?.[1];
  if (alias && !url.searchParams.get('category')) url.searchParams.set('category', decodeURIComponent(alias));
  for (const key of [...url.searchParams.keys()]) if (!collectionFilters.has(key)) url.searchParams.delete(key);
  const intro = introductions[url.searchParams.get('category') || ''];
  const description = `Browse ${heading.toLowerCase()} at Rastlina. Shop ready-to-gift plants with a self-watering pot and soil mix, delivered across India.`;
  // Utility/search facets remain usable without creating unlimited search landing pages.
  const noIndex = empty || ['search', 'space', 'size', 'color', 'min_price', 'max_price', 'care_level', 'pet_friendly', 'air_purifying'].some(key => Boolean(url.searchParams.get(key)));
  return { title: `${heading} | Buy Indoor Plants Online | Rastlina`, description,
    path: canonicalUrl(`${url.pathname}${url.search}`), noIndex,
    intro: intro || `Explore ${heading.toLowerCase()} and compare the current plants, sizes and prices. Read each product’s care guide to choose a suitable position.`,
  };
}
