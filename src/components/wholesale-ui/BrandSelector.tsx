import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Grid2X2 } from 'lucide-react';
import { getBrandAsset } from '@/lib/wholesale-ui/brands';
import Image from './CatalogImage';
import styles from '@/styles/wholesale-ui/brands.module.css';

export function BrandSelector({ brands, selected, onSelect }: { brands: string[]; selected: string; onSelect: (brand: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const track = useRef<HTMLDivElement>(null);
  const signature = brands.join('|');
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    return () => { observer.disconnect(); el.removeEventListener('scroll', update); };
  }, [signature, expanded]);
  useEffect(() => {
    const el = track.current;
    const active = el?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!el || !active || expanded) return;
    // Reveal the selected brand in the rail without moving the page.
    if (active.offsetLeft < el.scrollLeft || active.offsetLeft + active.offsetWidth > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: Math.max(0, active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2), behavior: 'instant' });
    }
  }, [selected, signature, expanded]);
  function scroll(direction: number) {
    const el = track.current;
    el?.scrollBy({ left: direction * el.clientWidth * .75, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <section className={styles.selector} aria-label="Marcas de accesorios">
    <div className={styles.heading}>
      <h3>Marcas de accesorios <span>{brands.length}</span></h3>
      <div className={styles.actions}>
        {!expanded && <div className={styles.arrows}>
          <button type="button" aria-label="Marcas anteriores" disabled={edges.start} onClick={() => scroll(-1)}><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Más marcas" disabled={edges.end} onClick={() => scroll(1)}><ChevronRight size={17} /></button>
        </div>}
        <button type="button" className={styles.expand} aria-expanded={expanded} aria-controls="accessory-brand-options" onClick={() => setExpanded(value => !value)}>{expanded ? 'Ver menos' : 'Ver todas'}<ChevronDown size={16} /></button>
      </div>
    </div>
    <div ref={track} id="accessory-brand-options" className={`${styles.track} ${expanded ? styles.expanded : ''}`}>
      {['', ...brands].map(brand => {
        const asset = getBrandAsset(brand);
        const active = selected === brand;
        return <button type="button" key={brand} className={styles.card} aria-pressed={active} aria-label={brand ? `Filtrar por ${brand}` : 'Todas las marcas'} onClick={() => { onSelect(brand); setExpanded(false); }}>
          <span className={styles.logo}>{!brand ? <Grid2X2 size={27} strokeWidth={1.6} /> : asset && !failed[brand] ? <Image src={asset.logo} alt="" width={112} height={42} loading="lazy" decoding="async" onError={() => setFailed(value => ({ ...value, [brand]: true }))} /> : <span className={styles.monogram} aria-hidden="true">{brand.slice(0, 2).toUpperCase()}</span>}</span>
          <span className={styles.name}>{brand || 'Todas'}</span>
          {active && <span className={styles.check}><Check size={11} strokeWidth={3} /></span>}
        </button>;
      })}
    </div>
  </section>;
}
