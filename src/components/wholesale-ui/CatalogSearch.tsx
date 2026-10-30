import { useDeferredValue, useId, useMemo, useState } from 'react';
import { ArrowUpRight, Search, Smartphone, X } from 'lucide-react';
import Image from './CatalogImage';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import type { DeviceCompatibility } from '@/lib/wholesale-ui/wholesaleProductRules';
import { filterWholesaleCatalog, searchTokens, sortProducts } from '@/lib/wholesale-ui/catalogFilters';
import { money } from '@/lib/wholesale-ui/catalogData';
import styles from '@/styles/wholesale-ui/commerce.module.css';

type Option =
  | { kind: 'product'; product: WholesaleProduct }
  | { kind: 'device'; device: DeviceCompatibility };
export function CatalogSearch({ value, onChange, products, devices, onProduct, onDevice }: { value: string; onChange: (value: string) => void; products: WholesaleProduct[]; devices: DeviceCompatibility[]; onProduct: (p: WholesaleProduct) => void; onDevice: (device: DeviceCompatibility) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false), [active, setActive] = useState(-1);
  const query = useDeferredValue(value);
  const options = useMemo<Option[]>(() => {
    if (query.trim().length < 2) return [];
    const tokens = searchTokens(query);
    const modelOptions: Option[] = devices.filter(d => { const words = searchTokens(`${d.manufacturer} ${d.model}`); return tokens.length && tokens.every(t => words.some(w => /^\d+$/.test(t) ? w === t : w.startsWith(t))); }).slice(0, 2).map(device => ({ kind: 'device', device }));
    const productOptions: Option[] = sortProducts(filterWholesaleCatalog(products, { search: query }), 'recommended', query).slice(0, 4).map(product => ({ kind: 'product', product }));
    return [...modelOptions, ...productOptions];
  }, [query, products, devices]);
  const shown = open && value.trim().length >= 2;
  function choose(option: Option) { setOpen(false); setActive(-1); if (option.kind === 'device') onDevice(option.device); else onProduct(option.product); }
  return <div className={styles.searchBox} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <div className={styles.searchInput}>
      <Search size={20} aria-hidden="true" />
      <input role="combobox" aria-label="Buscar productos" aria-autocomplete="list" aria-expanded={shown} aria-controls={`${id}-options`} aria-activedescendant={shown && active >= 0 && options[active] ? `${id}-${active}` : undefined} value={value} placeholder="Modelo, producto o código…" autoComplete="off" onFocus={() => setOpen(true)} onChange={e => { onChange(e.target.value); setActive(-1); setOpen(true); }} onKeyDown={e => {
        if (e.key === 'Escape') { setOpen(false); setActive(-1); }
        if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, options.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
        if (e.key === 'Enter') { e.preventDefault(); if (shown && active >= 0 && options[active]) choose(options[active]); else { setOpen(false); document.getElementById('result-heading')?.focus(); } }
      }} />
      {value && <button type="button" aria-label="Borrar búsqueda" onClick={() => { onChange(''); setActive(-1); }}><X size={17} /></button>}
      <kbd>⌕</kbd>
    </div>
    {shown && <div className={styles.suggestions}>
      <div className={styles.suggestionHeading}>ENCUENTRA TU PRÓXIMO PRODUCTO <span>{query !== value ? 'Buscando…' : '↵ para abrir'}</span></div>
      <ul id={`${id}-options`} role="listbox" aria-label="Sugerencias de búsqueda">
        {options.map((option, i) => <li key={option.kind === 'product' ? option.product.sku : `${option.device.manufacturer}-${option.device.model}`} id={`${id}-${i}`} role="option" aria-selected={active === i} className={active === i ? styles.optionActive : ''} onMouseDown={e => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => choose(option)}>
          {option.kind === 'device' ? <><span className={styles.deviceIcon}><Smartphone size={22} /></span><span><strong>{option.device.manufacturer} {option.device.model}</strong><small>Ver todos los accesorios compatibles</small></span></> : <><Image src={option.product.thumbnail} alt="" width={44} height={48} sizes="44px" /><span><strong>{option.product.name}</strong><small>{option.product.brand} · {option.product.sku}</small></span><b>{option.product.price ? money(option.product.price) : 'Consultar'}</b></>}
          <ArrowUpRight size={14} />
        </li>)}
      </ul>
      {!options.length && <p className={styles.searchEmpty}>No hay coincidencias. Prueba con el modelo o el código del producto.</p>}
      <button className={styles.searchAll} onClick={() => { setOpen(false); document.getElementById('result-heading')?.focus(); }}>Ver los resultados del catálogo <ArrowUpRight size={15} /></button>
    </div>}
  </div>;
}
