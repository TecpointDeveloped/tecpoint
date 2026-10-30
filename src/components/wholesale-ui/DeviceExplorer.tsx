import { useMemo, useState } from 'react';
import { ArrowRight, ChevronRight, ShieldCheck, Smartphone, Search } from 'lucide-react';
import Image from './CatalogImage';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import { productFamily, searchTokens } from '@/lib/wholesale-ui/catalogFilters';
import styles from '@/styles/wholesale-ui/explorer.module.css';
type Props = { products: WholesaleProduct[]; category: string; manufacturer: string; model: string; onSelect: (family: string, manufacturer: string, model: string) => void };
export function DeviceExplorer({ products, category, manufacturer, model, onSelect }: Props) {
  const family = category === '__covers' ? 'covers' : category === '__glass' ? 'glass' : category === '__accessories' || model ? 'accessories' : '';
  const [query, setQuery] = useState(''), [expanded, setExpanded] = useState(false);
  const families = useMemo(() => ({ covers: products.filter(p => productFamily(p) === 'covers'), glass: products.filter(p => productFamily(p) === 'glass'), accessories: products.filter(p => p.devices.length) }), [products]);
  const index = useMemo(() => {
    const result = new Map<string, Map<string, WholesaleProduct[]>>();
    for (const p of families[family as keyof typeof families] || []) for (const d of p.devices) {
      if (!result.has(d.manufacturer)) result.set(d.manufacturer, new Map());
      const models = result.get(d.manufacturer)!;
      if (!models.has(d.model)) models.set(d.model, []);
      models.get(d.model)!.push(p);
    }
    return result;
  }, [families, family]);
  const makers = [...index.keys()].sort();
  const models = useMemo(() => [...(index.get(manufacturer) || [])].sort(([a], [b]) => a.localeCompare(b, 'es', { numeric: true })).filter(([name]) => { const words = searchTokens(name); return searchTokens(query).every(t => words.some(w => /^\d+$/.test(t) ? w === t : w.startsWith(t))); }), [index, manufacturer, query]);
  const familyOptions = [
    ['covers', 'Cobertores', 'Protección que va con tu estilo.', Smartphone],
    ['glass', 'Vidrios y protección', 'El ajuste correcto para cada pantalla.', ShieldCheck],
  ] as const;
  function select(f: string, maker = '', phone = '') { setQuery(''); setExpanded(false); onSelect(f, maker, phone); }
  return <section className={styles.explorer} id="explorar" aria-labelledby="explorer-title">
    <header className={styles.heading}><div><span>UNA BÚSQUEDA. TODAS TUS OPCIONES.</span><h2 id="explorer-title">Cada teléfono tiene su selección.</h2><p>Elige una categoría, la marca y el modelo. Nosotros reunimos las opciones compatibles.</p></div><span className={styles.stepLabel}>{!family ? '01 / CATEGORÍA' : !manufacturer ? '02 / MARCA' : '03 / MODELO'}</span></header>
    <div className={styles.familyGrid}>{familyOptions.map(([f, label, description, Icon]) => { const group = families[f], p = group.find(p => !p.image.includes('isologo')); return <button key={f} className={`${styles.family} ${family === f ? styles.selected : ''}`} aria-pressed={family === f} onClick={() => select(f)}><div><Icon size={22} /><h3>{label}</h3><p>{description}</p><span>{group.length} opciones <ArrowRight size={17} /></span></div>{p && <Image src={p.thumbnail} alt="" width={150} height={150} sizes="150px" />}</button>; })}</div>
    <button className={styles.allPhones} aria-pressed={family === 'accessories'} onClick={() => select('accessories')}><Smartphone size={16} />Buscar todos los accesorios por teléfono <ArrowRight size={15} /></button>
    {family && <div className={styles.browser}>
      <nav className={styles.breadcrumbs} aria-label="Selección de teléfono"><button onClick={() => select(family)}>{family === 'covers' ? 'Cobertores' : family === 'glass' ? 'Vidrios y protección' : 'Todos los accesorios'}</button>{manufacturer && <><ChevronRight size={14} /><button onClick={() => select(family, manufacturer)}>{manufacturer}</button></>}{model && <><ChevronRight size={14} /><strong>{model}</strong></>}</nav>
      <div className={styles.makers} aria-label="Marca del teléfono">{makers.map(m => <button key={m} aria-pressed={manufacturer === m} className={manufacturer === m ? styles.active : ''} onClick={() => select(family, m)}>{m}<span>{index.get(m)!.size} modelos</span></button>)}</div>
      {manufacturer && <><div className={styles.modelsHeading}><h3>{model ? 'Cambiar de modelo' : `Selecciona tu ${manufacturer}`}</h3><label><Search size={16} /><input aria-label="Buscar modelo de teléfono" placeholder="Ej. iPhone 15 Pro…" value={query} onChange={e => { setQuery(e.target.value); setExpanded(false); }} /></label></div><div className={styles.models}>{models.slice(0, expanded ? undefined : 8).map(([name, matched]) => { const p = matched.find(p => !p.image.includes('isologo')); return <button key={name} className={model === name ? styles.modelActive : ''} aria-pressed={model === name} onClick={() => select('accessories', manufacturer, name)}>{p ? <Image src={p.thumbnail} alt="" width={48} height={60} sizes="48px" /> : <Smartphone size={28} />}<span><strong>{name}</strong><small>{matched.length} {matched.length === 1 ? 'opción' : 'opciones'} en este grupo</small></span><ChevronRight size={16} /></button>; })}</div>{!models.length && <p className={styles.note}>No hay un modelo confirmado con ese nombre.</p>}{models.length > 8 && !expanded && <button className={styles.more} onClick={() => setExpanded(true)}>Ver los {models.length} modelos <ArrowRight size={15} /></button>}</>}
      <p className={styles.note}>Compatibilidades según el archivo recibido. Los productos sin modelo asociado siguen disponibles en la categoría completa.</p>
    </div>}
  </section>;
}
