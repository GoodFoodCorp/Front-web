/** The 14 allergens of regulation (EU) 1169/2011, by menu-service code. In
 *  France they must be shown for every dish before the purchase, online
 *  included (décret n° 2015-447). */
export const ALLERGENS = [
  { code: 'gluten', label: 'Gluten', icon: '🌾' },
  { code: 'crustaces', label: 'Crustacés', icon: '🦐' },
  { code: 'oeufs', label: 'Œufs', icon: '🥚' },
  { code: 'poissons', label: 'Poissons', icon: '🐟' },
  { code: 'arachides', label: 'Arachides', icon: '🥜' },
  { code: 'soja', label: 'Soja', icon: '🫘' },
  { code: 'lait', label: 'Lait', icon: '🥛' },
  { code: 'fruits_a_coque', label: 'Fruits à coque', icon: '🌰' },
  { code: 'celeri', label: 'Céleri', icon: '🥬' },
  { code: 'moutarde', label: 'Moutarde', icon: '🟡' },
  { code: 'sesame', label: 'Sésame', icon: '⚪' },
  { code: 'sulfites', label: 'Sulfites', icon: '🍷' },
  { code: 'lupin', label: 'Lupin', icon: '🌼' },
  { code: 'mollusques', label: 'Mollusques', icon: '🦪' },
] as const;

const BY_CODE = new Map<string, (typeof ALLERGENS)[number]>(ALLERGENS.map((a) => [a.code, a]));

export const allergenLabel = (code: string) => BY_CODE.get(code)?.label ?? code;
export const allergenIcon = (code: string) => BY_CODE.get(code)?.icon ?? '•';
