import type { ApiProductDetail } from '@/pages/ProductDetail';

// Reviewed against RHS houseplant/calathea guides and NC State Plant Toolbox.
// Exact SKU matching keeps future catalogue additions out of this editorial pass.
type CareKey = 'tropical' | 'moist' | 'calathea' | 'dry' | 'jade' | 'peperomia' | 'begonia' | 'bamboo';
type Entry = { name: string; intro: string; care: CareKey; members?: string[] };
const tropical = 'Let the upper layer of soil dry before watering; keep the root zone drained rather than saturated.';
const moist = 'Keep the mix lightly moist, checking before watering. Do not leave the roots standing in water.';
const care: Record<CareKey, { light: string; water: string; tip: string }> = {
  tropical: { light: 'Bright, indirect light', water: tropical, tip: 'Keep away from hot afternoon sun and direct air-conditioning drafts. Wipe dusty leaves gently.' },
  moist: { light: 'Bright, indirect light; avoid harsh sun', water: moist, tip: 'Protect from dry air and cold drafts. Adjust watering as growth and indoor conditions change.' },
  calathea: { light: 'Bright, filtered light; avoid direct sun', water: moist, tip: 'Calatheas appreciate humidity and warmth. Use rainwater or filtered water when tap-water minerals cause leaf-tip damage.' },
  dry: { light: 'Bright, indirect light', water: 'Allow the potting mix to dry well between waterings. Water less in dim light or slower growth.', tip: 'Avoid a continuously full reservoir: these plants store water and are vulnerable to overwatering.' },
  jade: { light: 'A bright window; introduce direct sun gradually', water: 'Allow the mix to dry between waterings. Avoid prolonged wet soil.', tip: 'Jade needs more light and less frequent watering than many tropical foliage plants. Keep its reservoir empty while the mix is moist.' },
  peperomia: { light: 'Bright, indirect light', water: 'Let the upper layer of mix dry before watering; avoid waterlogged soil.', tip: 'Peperomia is a diverse genus. Follow the plant label for species-specific needs and avoid keeping the reservoir permanently full.' },
  begonia: { light: 'Bright, indirect light; avoid scorching sun', water: 'Water when the surface starts to dry; keep the mix drained and avoid wetting the crown.', tip: 'Provide humidity with ventilation. Keep water off the foliage and crown where possible.' },
  bamboo: { light: 'Indirect light; avoid harsh direct sun', water: 'For this soil-grown set, keep the mix lightly moist without saturating it.', tip: 'Lucky bamboo is a Dracaena, not a true bamboo. Use filtered water if mineral-heavy tap water damages leaf tips.' },
};

const entries: Record<string, Entry> = {};
function add(sku: string, name: string, intro: string, profile: CareKey = 'tropical') {
  entries[sku] = { name, intro, care: profile };
}
add('ZZPL-01', 'ZZ Plant', 'An upright foliage plant for adding greenery to a room without a frequent watering routine.', 'dry');
add('SYNG-08', 'Syngonium White Butterfly', 'White Butterfly brings a named Syngonium selection to your indoor plant collection.');
add('SYNG-07', 'Syngonium Variegated', 'A variegated Syngonium selection for a foliage-focused indoor display.');
add('SYNG-06', 'Syngonium Silver Pearl', 'Silver Pearl is an indoor Syngonium selection for a thoughtfully chosen living gift.');
add('SYNG-05', 'Syngonium Podophyllum', 'An arrowhead foliage plant for growing a small indoor collection.');
add('SYNG-04', 'Syngonium Pink', 'The pink Syngonium selection adds a colour-focused option to your indoor greenery.');
add('SYNG-03', 'Syngonium Holly', 'Holly offers another named Syngonium selection for indoor plant enthusiasts.');
add('SYNG-02', 'Syngonium Green Variegated', 'A green variegated Syngonium selection for a layered indoor foliage display.');
add('SYNG-01', 'Syngonium Green', 'Green Syngonium is a foliage-focused choice for a well-lit indoor space.');
add('SPID-01', 'Spider Plant', 'Spider plant is a familiar indoor foliage choice with arching leaves.');
add('SONG-01', 'Song of Jamaica', 'Song of Jamaica offers a Dracaena selection for your indoor plant collection.');
add('SNAK-01', 'Snake Plant', 'An upright foliage plant with a distinctive silhouette and a preference for drying between waterings.', 'dry');
add('REXB-01', 'Rex Begonia', 'Rex begonia is grown for its decorative foliage rather than a promise of flowers.', 'begonia');
add('PHIL-11', 'Philodendron Super Atom', 'Super Atom offers a named foliage selection for Philodendron collectors.');
add('PHIL-10', 'Philodendron Squamiferum', 'Squamiferum adds a distinct Philodendron selection to a tropical foliage collection.');
add('PHIL-09', 'Philodendron Silver Sword', 'Silver Sword offers a named Philodendron selection for a foliage-led indoor display.');
add('PHIL-08', 'Philodendron Moonshine', 'The Moonshine-labelled Philodendron is offered as a living indoor gift.');
add('PHIL-07', 'Philodendron Joepii', 'Joepii is a Philodendron selection for enthusiasts building a varied indoor collection.');
add('PHIL-06', 'Philodendron Florida Ghost', 'Florida Ghost adds another named selection to a Philodendron-focused plant collection.');
add('PHIL-05', 'Philodendron Congo Red', 'Congo Red offers a colour-focused Philodendron choice for indoor greenery.');
add('PHIL-04', 'Philodendron Ceylon Green', 'Ceylon Green is a foliage selection for an indoor Philodendron display.');
add('PHIL-03', 'Philodendron Ceylon Gold', 'Ceylon Gold offers another named Philodendron option for a living plant gift.');
add('PHIL-02', 'Philodendron Birkin', 'Birkin is a named Philodendron selection for indoor foliage enthusiasts.');
add('PHIL-01', 'Philodendron Billietiae', 'Billietiae offers a distinct Philodendron selection for a tropical indoor collection.');
add('PEPP-01', 'Peperomia', 'Peperomia is offered as a foliage plant; the exact species is not specified in this listing.', 'peperomia');
add('SPAT-02', 'Peace Lily (Spathiphyllum)', 'Peace lily is a tropical foliage plant that may produce white spathes under suitable conditions. Flowering varies.', 'moist');
add('SPAT-01', 'Spathiphyllum Chinese', 'This Chinese-labelled Spathiphyllum selection is offered as a living indoor gift; blooms depend on growing conditions.', 'moist');
add('MONE-04', 'Money Plant Marble Queen', 'Marble Queen is a named money plant selection for a variegated foliage collection.');
add('MONE-03', 'Money Plant Green', 'Green money plant offers a classic foliage choice for an indoor plant display.');
add('MONE-02', 'Money Plant Golden', 'Golden money plant adds another named foliage selection to your indoor greenery.');
add('MONE-01', 'Money Plant Enjoy', 'The Enjoy-labelled money plant is a foliage choice for gifting or growing at home.');
add('LUCK-01', 'Lucky Bamboo', 'Lucky bamboo is a Dracaena plant traditionally chosen as a living gift; it does not guarantee luck or prosperity.', 'bamboo');
add('JADE-01', 'Jade Plant', 'Jade is a fleshy-leaved plant for a bright indoor position. Its watering needs differ from moisture-loving foliage plants.', 'jade');
add('FITT-01', 'Fittonia', 'Fittonia, also called nerve plant, is grown for its patterned foliage in humid indoor conditions.', 'moist');
add('FICU-01', 'Fiddle Leaf Fig (Ficus Lyrata)', 'Fiddle leaf fig is grown for its broad leaves and offers a foliage-led focal point indoors.');
add('CRYP-01', 'Cryptanthus Bivittatus', 'Cryptanthus bivittatus is a terrestrial bromeliad for a small indoor foliage collection.', 'moist');
add('CHIN-01', 'Chinese Money Plant', 'Chinese money plant is offered as a distinct indoor foliage option; it is different from the trailing money plant selections.');
add('CALA-05', 'Calathea Warscewiczii', 'Warscewiczii is a Calathea selection for a warm, humid indoor growing space.', 'calathea');
add('CALA-04', 'Calathea Roseopicta Green Lipstick', 'Green Lipstick offers a named Calathea selection for foliage-focused indoor styling.', 'calathea');
add('CALA-03', 'Calathea Ornata', 'Ornata is a Calathea selection for a sheltered position with filtered light.', 'calathea');
add('CALA-02', 'Calathea Louisae', 'Louisae adds another Calathea selection to a humidity-loving indoor collection.', 'calathea');
add('CALA-01', 'Calathea Lancifolia', 'Lancifolia is a Calathea selection commonly associated with the rattlesnake plant.', 'calathea');
add('RUB-01', 'Burgundy Rubber Plant (Ficus)', 'Burgundy rubber plant is a named Ficus selection for a foliage-led indoor display.');
add('ANTH-01', 'Anthurium Red', 'Red Anthurium is chosen for its foliage and coloured spathes. Flowering and colour presentation vary with maturity and conditions.', 'moist');
add('ALOC-01', 'Alocasia Lauterbachiana', 'Lauterbachiana is an Alocasia selection for an indoor grower who can provide warmth and regular moisture checks.', 'moist');
add('AGLA-07', 'Aglaonema Super White', 'Super White is a named Aglaonema selection for a foliage-focused indoor collection.');
add('AGLA-06', 'Aglaonema Suksom Jaipong', 'Suksom Jaipong is offered as a named Aglaonema selection for indoor plant gifting.');
add('AGLA-05', 'Aglaonema Snow White', 'Snow White adds a named Aglaonema selection to your indoor greenery.');
add('AGLA-04', 'Aglaonema Rotundum Hybrid Peacock', 'The Peacock-labelled Rotundum hybrid is an Aglaonema foliage selection.');
add('AGLA-03', 'Aglaonema Lipstick Red', 'Lipstick Red offers a colour-focused Aglaonema selection for indoor styling.');
add('AGLA-02', 'Aglaonema Lady Valentine', 'Lady Valentine is a named Aglaonema selection for a living plant gift.');
add('AGLA-01', 'Aglaonema Chinese Evergreen', 'Chinese evergreen is an Aglaonema foliage plant for a sheltered indoor position.');

const bundles: Record<string, string[]> = {
  'SET4-05': ['AGLA-02', 'MONE-02', 'SNAK-01', 'CALA-02'],
  'SET4-04': ['PHIL-11', 'MONE-02', 'CALA-02', 'SNAK-01'],
  'SET4-03': ['PHIL-11', 'MONE-02', 'JADE-01', 'CALA-02'],
  'SET4-02': ['JADE-01', 'AGLA-03', 'MONE-02', 'CALA-02'],
  'SET4-01': ['AGLA-01', 'AGLA-03', 'JADE-01', 'MONE-02'],
  'SET3-07': ['PEPP-01', 'AGLA-06', 'SYNG-05'],
  'SET3-06': ['AGLA-01', 'AGLA-03', 'JADE-01'],
  'SET3-05': ['PHIL-09', 'AGLA-06', 'PEPP-01'],
  'SET3-04': ['SPAT-02', 'SYNG-04', 'CALA-05'],
  'SET3-03': ['AGLA-04', 'RUB-01', 'SYNG-08'],
  'SET3-02': ['PHIL-08', 'PEPP-01', 'SYNG-08'],
  'SET3-01': ['MONE-01', 'SYNG-08', 'SYNG-04'],
  'SET2-07': ['AGLA-03', 'JADE-01'],
  'SET2-06': ['SNAK-01', 'JADE-01'],
  'SET2-05': ['SNAK-01', 'PEPP-01'],
  'SET2-04': ['SYNG-08', 'PEPP-01'],
  'SET2-03': ['SYNG-04', 'SYNG-01'],
  'SET2-02': ['AGLA-05', 'SYNG-04'],
  'SET2-01': ['AGLA-01', 'AGLA-03'],
};
// Bundle labels are kept as listed: don't infer an unconfirmed cultivar from
// shortened names such as "Syngonium White" or "Philodendron Silver".
export const reviewedProductSkus = [...Object.keys(entries), ...Object.keys(bundles)];

export function applyProductEditorial(product: ApiProductDetail): ApiProductDetail {
  const entry = entries[product.sku];
  const members = bundles[product.sku];
  if (!entry && !members) return product;
  const name = entry?.name || product.name.replace(/Pepperomia/g, 'Peperomia').replace(/Synogium/g, 'Syngonium').replace(/Set (?:0f|os) /g, 'Set of ').replace(/\s+/g, ' ').trim();
  const profile = care[entry?.care || 'tropical'];
  const intro = entry?.intro || `This set brings together ${product.name.split(/ - Set/i)[0].replace(/Pepperomia/g, 'Peperomia').replace(/Synogium/g, 'Syngonium')} for a varied indoor plant display. Care for each plant separately: mixed sets can have different light and watering needs.`;
  const instructions = members
    ? members.map((sku, index) => `${product.name.split(/ - Set/i)[0].split(/\s*[|&]\s*/)[index] || entries[sku].name}: ${care[entries[sku].care].light}. ${care[entries[sku].care].water}`)
    : [profile.tip];
  return {
    ...product,
    name,
    description: `${name}\n\n${intro}\n\nSupplied as a ready-to-gift indoor plant set with a self-watering pot and soil mix. A living gift for birthdays, housewarmings, thank-you gestures and other occasions.\n\nPlants are living items: leaf patterns, shape and growth vary naturally. Use the care guide to choose a suitable position for the plant.`,
    sunlight: members ? 'Match each plant to its own light needs' : profile.light,
    watering: members ? 'Check each pot separately; follow the guide below' : profile.water,
    temperature: 'Protect from cold drafts and extreme heat',
    growth_rate: '',
    pet_friendly: null,
    air_purifying: false,
    care_instructions_list: [...instructions,
      'Self-watering pot: check the soil as well as the reservoir before refilling. A reservoir does not remove the need to monitor moisture; avoid keeping the mix saturated.',
      'Water according to soil moisture, light and season, rather than a fixed number of days. Make sure excess water can drain.',
      'Keep plants out of reach of pets and small children. Check the exact plant identity before choosing it for an area where leaves may be chewed.',
    ],
    what_you_get_list: [members ? `Indoor plant combo as listed (${members.length} plants)` : 'Indoor plant as listed', 'Self-watering pot with soil mix'],
  };
}
