import { ArrowUpRight, Check, Percent, Zap } from 'lucide-react';
import { hasOffer } from '@/lib/wholesale-ui/catalogFilters';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import styles from '@/styles/wholesale-ui/promotions.module.css';

export function PromotionEntrances({ products, selected, onSelect }: { products: WholesaleProduct[]; selected: string; onSelect: (selection: 'liquidation' | 'offers') => void }) {
  const liquidation = products.filter(p => p.stock > 0 && p.stock <= 2).length;
  const offers = products.filter(hasOffer);
  const discounts = offers.map(p => Math.round((1 - p.price! / p.originalPrice!) * 10000) / 100);
  const maximum = Math.max(0, ...discounts);
  return <section className={styles.promotions} aria-label="Liquidación y ofertas">
    <button className={`${styles.promotion} ${styles.liquidation}`} aria-pressed={selected === 'liquidation'} onClick={() => onSelect('liquidation')}>
      <span className={styles.tag}><Zap size={14} />ÚLTIMAS UNIDADES</span><strong>Liquidación<span className={styles.mark}>↘</span></strong>
      <span className={styles.description}>Tu próxima oportunidad.<br />Consulta el precio especial.</span>
      <span className={styles.bottom}><span>{liquidation} productos para explorar</span>{selected === 'liquidation' ? <Check size={22} /> : <ArrowUpRight size={22} />}</span>
    </button>
    <button className={`${styles.promotion} ${styles.offers}`} aria-pressed={selected === 'offers'} onClick={() => onSelect('offers')}>
      <span className={styles.tag}><Percent size={14} />{offers.length ? 'DESCUENTOS ACTIVOS' : 'PRECIOS PARA APROVECHAR'}</span><strong>Ofertas<span className={styles.mark}>{maximum ? <><small>hasta</small>−{maximum}%</> : '%'}</span></strong>
      <span className={styles.description}>{offers.length ? 'Compara el antes y el ahora.\nMira cuánto ahorras.' : 'Estamos preparando\nlas próximas promociones.'}</span>
      <span className={styles.bottom}><span>{offers.length ? `${offers.length} productos con descuento` : 'Explorar ofertas'}</span>{selected === 'offers' ? <Check size={22} /> : <ArrowUpRight size={22} />}</span>
    </button>
  </section>;
}
