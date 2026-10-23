export function normalizeProductName(name: string): string {
  return name.replace(/Pepperomia/g, 'Peperomia')
    .replace(/\bAgalonema\b/gi, 'Aglaonema')
    .replace(/\bCalathe\b/gi, 'Calathea')
    .replace(/Synogium/g, 'Syngonium')
    .replace(/Set (?:0f|os) /g, 'Set of ')
    .replace(/\s+/g, ' ').trim();
}
