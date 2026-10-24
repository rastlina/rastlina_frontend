// Reviewed against the public catalogue on 24 October 2026. Live product pages own price and stock.
export const vastuPicks = [
  {
    "name": "Money Plant Golden",
    "slug": "money-plant-golden",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_1y3Drot.webp",
    "association": "Abundance & a welcoming start",
    "direction": "Southeast is a common traditional suggestion.",
    "description": "Its golden, heart-shaped foliage makes this the natural first pick for a bright living-room shelf. Money plants are widely associated with prosperity in popular Vastu guidance.",
    "care": "Choose bright, indirect light. Let the top 2–3 cm of mix dry before watering; keep the trailing stems clear of walkways."
  },
  {
    "name": "Lucky Bamboo",
    "slug": "lucky-bamboo",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_HMdSGDO.webp",
    "association": "Harmony & new beginnings",
    "direction": "East or southeast, wherever filtered light is available.",
    "description": "A familiar housewarming choice, Lucky Bamboo is associated with harmony and growth in contemporary Vastu-inspired homes. Its upright stems suit a desk or a compact console.",
    "care": "Rastlina’s plant is grown in soil. Keep the mix lightly moist, avoid strong direct sun, and check soil moisture before refilling the reservoir."
  },
  {
    "name": "Jade",
    "slug": "jade",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_X0F9io3.webp",
    "association": "Growth & prosperity",
    "direction": "A bright southeast spot or a well-lit entrance.",
    "description": "Jade’s small rounded leaves and branching shape make it an appealing symbolic gift for a new home or workspace. It needs a brighter position than most foliage plants in this list.",
    "care": "Give it very bright light and introduce gentle morning sun gradually. Let the soil dry throughout; allow the reservoir to empty before refilling."
  },
  {
    "name": "Spathiphyllum",
    "slug": "spathiphyllum",
    "image": "https://api.rastlina.com/media/products/01_peace_lilly_lifestyle.webp",
    "association": "Peace & a calm corner",
    "direction": "A sheltered, well-lit indoor corner; direction advice varies.",
    "description": "Spathiphyllum is the Peace Lily in our catalogue. Popular Vastu writing associates it with harmony, while its glossy foliage brings a softer look to a reading corner. White spathes appear when growing conditions allow.",
    "care": "Provide bright, indirect light and lightly moist, drained mix. Check both soil and reservoir before watering. For a limp plant, read our <a href=\"/blog/2\">Peace Lily care guide</a>."
  },
  {
    "name": "Black Ficus Burgundy - Rubber Plant",
    "slug": "black-ficus-burgundy-rubber-plant",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_5rqKIM3.webp",
    "association": "Stability & a strong focal point",
    "direction": "A bright southeast corner is a common suggestion.",
    "description": "The Rubber Plant’s broad, glossy leaves are associated with stability and prosperity in modern Vastu-inspired styling. Rastlina’s burgundy selection adds a rich contrast beside pale walls and natural wood.",
    "care": "Use bright, indirect light, away from strong afternoon sun and AC drafts. Water after the top 2–3 cm dries; wipe dusty leaves gently."
  },
  {
    "name": "Snake Green",
    "slug": "snake-green",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_Bog1bpd.webp",
    "association": "Resilience & protection",
    "direction": "South or southeast appears in many modern guides.",
    "description": "Snake plants feature in many current Vastu lists as a symbol of protection and resilience. Snake Green is our clean, upright foliage choice for a narrow, well-lit corner.",
    "care": "Bright, indirect light is a good starting point. Let the soil dry throughout and avoid keeping the self-watering reservoir continuously full."
  },
  {
    "name": "Zz Plant",
    "slug": "zz-plant",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_eOOOcYW.webp",
    "association": "Steady growth & an easy routine",
    "direction": "North is a common contemporary desk-placement suggestion.",
    "description": "Modern Vastu-inspired desk guides include ZZ for its association with steady growth. Its glossy, upright foliage also suits a simple home-office arrangement.",
    "care": "Choose medium to bright, indirect light. It tolerates lower light but still needs light; let the soil dry throughout before watering."
  },
  {
    "name": "Aglaonema Chinese Evergreen",
    "slug": "aglaonema-chinese-evergreen",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_LzaWVvn.webp",
    "association": "Good luck & fresh foliage",
    "direction": "East is often suggested in contemporary guides.",
    "description": "Chinese Evergreen is commonly included in modern lucky-plant selections. This green Aglaonema offers patterned foliage for a warm living room or work area.",
    "care": "Choose bright, indirect light and a stable position away from cold drafts. Allow the top 2–3 cm of soil to dry, then water according to actual moisture."
  },
  {
    "name": "Syngonium Podophyllum",
    "slug": "syngonium-podophyllum",
    "image": "https://api.rastlina.com/media/products/01-lifestyle-hero_55yTFRj.webp",
    "association": "Balance & growing greenery",
    "direction": "North appears in contemporary Vastu desk guides.",
    "description": "Syngonium’s arrow-shaped leaves give a light, leafy finish to a shelf or desk. Modern Vastu-inspired guides associate this plant with growth and balance.",
    "care": "Provide bright, indirect light and water when the top 2 cm of soil has dried. Leave room for new growth and keep foliage clear of a busy work surface."
  },
  {
    "name": "Spider Plant",
    "slug": "spider-plant",
    "image": "https://api.rastlina.com/media/products/hf_20260303_082659_5d35dfd7-221b-43c6-8413-b8181c34d105.webp",
    "association": "A fresh, restful green corner",
    "direction": "A bright window-side shelf; exact directions vary.",
    "description": "Spider Plant is included in contemporary Vastu bedroom guides for a gentle green setting. Its arching striped leaves are especially effective on a raised shelf with room to spread.",
    "care": "Use bright, indirect light and let the upper 2 cm of soil dry before watering. Avoid intense sun on the leaf tips and keep the pot stable."
  }
];

const productCards = vastuPicks.map((plant, index) => `<section class="vastu-plant" id="plant-${index + 1}" aria-labelledby="plant-title-${index + 1}">
  <a class="vastu-plant-photo" href="/product/${plant.slug}" aria-label="Shop ${plant.name}"><img src="${plant.image}" alt="${plant.name} in a Rastlina self-watering pot" width="480" height="480" loading="lazy" decoding="async" /></a>
  <div class="vastu-plant-copy"><span class="vastu-number">${String(index + 1).padStart(2, '0')} / THE RASTLINA EDIT</span><h3 id="plant-title-${index + 1}">${plant.name}</h3><p class="vastu-association">${plant.association}</p><p>${plant.description}</p><dl><div><dt>Traditional placement</dt><dd>${plant.direction}</dd></div><div><dt>Care that comes first</dt><dd>${plant.care}</dd></div></dl><a class="vastu-shop-link" href="/product/${plant.slug}">Explore ${plant.name} <span aria-hidden="true">↗</span></a></div>
</section>`).join('');

export const vastuGuideContent = `
<section id="before-you-choose" class="vastu-intro"><p class="vastu-lead">A greener home begins with a plant that belongs in your space. If Vastu traditions are part of how you create that home, this is our considered edit of ten plants you can find at Rastlina.</p><p>We reviewed the full Rastlina catalogue and checked these ten products on 24 October 2026. Each was in stock when reviewed; follow its product link for current options and availability. This list combines familiar Vastu favourites with plants included in contemporary Vastu-inspired home and desk guides.</p><aside class="vastu-note"><strong>Tradition, with thoughtful care.</strong> Vastu associations are cultural beliefs, and placement advice differs between sources. Let the plant’s light, moisture and space requirements guide the final spot. A compass direction cannot replace a suitable growing environment.</aside></section>
<section id="quick-picks"><p class="vastu-eyebrow">FIND YOUR GREEN COMPANION</p><h2>Your top 10, at a glance</h2><p>Start with the light in your room, then choose the foliage and traditional meaning you enjoy.</p><ol class="vastu-quick-list">${vastuPicks.map((p, i) => `<li><a href="#plant-${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span>${p.name}</a></li>`).join('')}</ol></section>
<section id="plant-shortlist"><p class="vastu-eyebrow">ONLY FROM THE RASTLINA COLLECTION</p><h2>Ten plants. Ten ways to make it yours.</h2><p>Compare each plant’s foliage, placement and care, then follow its direct link to the Rastlina listing.</p>${productCards}</section>
<section id="placement" class="vastu-panel"><p class="vastu-eyebrow">A PLACE TO THRIVE</p><h2>Choose the room before the direction</h2><div class="vastu-advice-grid"><div><h3>Living room</h3><p>Give Money Plant Golden or the Burgundy Rubber Plant a bright position with filtered daylight. Keep paths and doors clear, and turn the pot occasionally for balanced growth.</p></div><div><h3>Desk or study</h3><p>Lucky Bamboo, ZZ or Chinese Evergreen can make a considered desk companion when there is suitable natural or grow light. Keep plants out of direct AC airflow.</p></div><div><h3>Reading corner</h3><p>Try Peace Lily, Syngonium or Spider Plant near indirect light. A dim decorative corner needs a grow light or a different growing position.</p></div><div><h3>Bright entrance</h3><p>Choose Jade only if the entrance has enough daylight. Protect the pot from being knocked over, and keep its soil much drier than the Peace Lily’s.</p></div></div></section>
<section id="care"><p class="vastu-eyebrow">THE EVERYDAY RITUAL</p><h2>Your self-watering pot still needs you</h2><p>Rastlina’s listed plant sets include a self-watering pot and growing mix. Check the soil as well as the reservoir: a full base is not a signal to add more water. Jade, Snake Green and ZZ need a drying period; Peace Lily and soil-grown Lucky Bamboo need a different moisture routine. Use the exact product’s care guide rather than one watering schedule for all ten.</p><p>Wipe dusty foliage, remove damaged leaves, and check new growth regularly. Keep chewable plants away from pets and small children, and check the plant’s exact identity before placing it where they can reach it. Photographs show representative styling; living plants vary naturally.</p></section>
<section id="questions" class="vastu-faq"><p class="vastu-eyebrow">A FEW GOOD QUESTIONS</p><h2>Before you bring one home</h2><details><summary>Which one should I start with?</summary><p>For a bright shelf, start with Money Plant Golden. For a well-lit desk, consider Lucky Bamboo. Choose Jade if you have very bright light and prefer to water less often. Your room and routine are more useful deciding factors than the number in this list.</p></details><details><summary>Do all ten belong in the same direction?</summary><p>No single direction suits every home or plant. Common suggestions include southeast for Money Plant and east or southeast for Lucky Bamboo, but modern guides vary. A location with the right light and safe access is essential.</p></details><details><summary>Can I order every plant mentioned here?</summary><p>All ten are Rastlina catalogue products and were in stock when this guide was checked on 24 October 2026. Use the direct product links to confirm current stock, size and price before ordering.</p></details><details><summary>Should Lucky Bamboo be kept in a glass of water?</summary><p>The Rastlina plant featured here is grown in soil in a self-watering pot. Follow its soil-care instructions rather than changing it to a water-only display.</p></details></section>
<section class="vastu-closing"><p class="vastu-eyebrow">GROW SOMETHING MEANINGFUL</p><h2>Find the plant that feels at home.</h2><p>Choose one thoughtfully, give it a good position, and build a care routine around it.</p><a class="vastu-button" href="/shop?main_category=plants">Explore Rastlina plants <span aria-hidden="true">↗</span></a></section>
<section id="sources" class="vastu-sources"><h2>Research &amp; reading</h2><p>Traditional associations were cross-checked against <a href="https://timesofindia.indiatimes.com/astrology/vastu-feng-shui/8-plants-traditionally-believed-to-attract-positivity-into-your-living-room/articleshow/132847086.cms" target="_blank" rel="noopener noreferrer">The Times of India’s Vastu plant guide</a>, <a href="https://www.urvann.com/blog/10-best-indoor-plants-for-office-desk-as-per-vastu" target="_blank" rel="noopener noreferrer">Urvann’s Vastu desk guide</a> and <a href="https://www.urvann.com/blog/how-to-select-indoor-plants-based-on-vastu-for-your-bedroom" target="_blank" rel="noopener noreferrer">Urvann’s bedroom guide</a>. These provide context for the traditional associations described above.</p><p>Growing guidance also draws on the current Rastlina product listings, the <a href="https://www.rhs.org.uk/plants/peace-lilies/how-to-grow-peace-lilies" target="_blank" rel="noopener noreferrer">RHS Peace Lily guide</a> and NC State Extension profiles for <a href="https://plants.ces.ncsu.edu/plants/epipremnum-aureum/" target="_blank" rel="noopener noreferrer">pothos</a>, <a href="https://plants.ces.ncsu.edu/plants/dracaena-sanderiana/" target="_blank" rel="noopener noreferrer">Lucky Bamboo</a> and <a href="https://plants.ces.ncsu.edu/plants/ficus-elastica/" target="_blank" rel="noopener noreferrer">Rubber Plant</a>.</p></section>`;

