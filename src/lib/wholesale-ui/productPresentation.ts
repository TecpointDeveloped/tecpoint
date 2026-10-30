/** Display facts taken literally from supplied titles, without inferring performance. */
export function titleFacts(name: string): Record<string, string> {
  const facts: Record<string, string> = {};
  const color = name.match(/(?:\s[-–]\s*|(?:en\s+)?color\s+)([A-Za-zÀ-ÿ /]+)\s*$/i)?.[1]?.trim();
  if (color && color.length < 48) facts['Color / variante'] = color;
  const watts = name.match(/\b\d+(?:\.\d+)?\s*W\b/ig);
  if (watts) facts['Potencia indicada'] = [...new Set(watts)].join(' / ');
  const capacity = name.match(/\b[\d,]+\s*mAh\b/i);
  if (capacity) facts['Capacidad indicada'] = capacity[0];
  const length = name.match(/\b\d+(?:\.\d+)?\s*(?:ft|feet|metros?)\b/i);
  if (length) facts['Longitud indicada'] = length[0];
  const connectors = [...new Set(name.match(/\b(?:USB[ -]?[AC]|Lightning|Micro[ -]?USB|HDMI)\b/ig) || [])];
  if (connectors.length) facts['Conectores mencionados'] = connectors.join(' · ');
  if (/\bMagSafe\b/i.test(name)) facts['Característica indicada'] = 'MagSafe';
  return facts;
}
export function displayTitle(name: string, brand: string) {
  let title = name.replace(/\s+/g, ' ').trim();
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  title = title.replace(new RegExp('\\b' + escapedBrand + '\\b', 'i'), '').replace(/\s+/g, ' ').trim().replace(/^(\w+)\s+\1\b/i, '$1');
  const variant = titleFacts(name)['Color / variante'];
  if (variant) title = title.replace(/(?:\s[-–]\s*|\s+(?:en\s+)?color\s+)[A-Za-zÀ-ÿ /]+\s*$/i, '').trim();
  return { title, variant };
}
export function cleanCategory(category: string, name: string, subcategory = '') {
  if (!/promo|descuento|black\s*(friday|november)/i.test(category)) return category;
  const text = `${name} ${subcategory}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/forro|cobertor|\bcase\b|funda/.test(text)) return 'Cobertores';
  if (/vidrio|protector.*pantalla|nanopolimero/.test(text)) return 'Vidrios y protección';
  if (/cargador|charger|cable|power bank|power strip|wall adapter/.test(text)) return 'Cables y Cargadores';
  if (/audifono|earbud|headphone|speaker|bocina/.test(text)) return 'Audio';
  return 'Accesorios';
}
