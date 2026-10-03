export function normalizeProductName(name: string): string {
  return name.replace(/Pepperomia/g, 'Peperomia')
    .replace(/Synogium/g, 'Syngonium')
    .replace(/Set (?:0f|os) /g, 'Set of ')
    .replace(/\s+/g, ' ').trim();
}
