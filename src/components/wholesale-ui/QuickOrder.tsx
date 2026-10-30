import { Minus, Plus, Search } from 'lucide-react';
import Image from './CatalogImage';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import { money } from '@/lib/wholesale-ui/catalogData';
import styles from '@/styles/wholesale-ui/commerce.module.css';
export function QuickOrder({ products, quantities, inCart, onQuantity, onProduct }: { products: WholesaleProduct[]; quantities: Record<string, number>; inCart: Map<string, number>; onQuantity: (sku: string, quantity: number) => void; onProduct: (p: WholesaleProduct) => void }) {
  return <div className={styles.quickOrder}><div className={styles.quickHead}><span>PRODUCTO / CÓDIGO</span><span>MAYOREO</span><span>CANTIDAD A AGREGAR</span></div>{products.map(p => { const amount = quantities[p.sku] || 0, available = Math.max(0, p.stock - (inCart.get(p.sku) || 0)); return <article key={p.sku} className={amount ? styles.quickSelected : ''}>
    <button className={styles.quickProduct} onClick={() => onProduct(p)}><Image src={p.thumbnail} width={58} height={64} sizes="58px" alt="" /><span><small>{p.brand}</small><strong>{p.name}</strong><span>{p.sku}{inCart.get(p.sku) ? ` · ${inCart.get(p.sku)} en tu pedido` : ''}</span></span><Search size={14} /></button>
    <div className={styles.quickPrice}><strong>{p.price ? money(p.price) : 'Consultar'}</strong><small>{available > 0 ? `Hasta ${available} más` : 'Máximo seleccionado'}</small></div>
    <div className={styles.quantity}><button disabled={!amount} onClick={() => onQuantity(p.sku, amount - 1)} aria-label={`Restar selección ${p.sku}`}><Minus size={15} /></button><input type="number" inputMode="numeric" min="0" max={available} aria-label={`Seleccionar cantidad ${p.sku}`} value={amount || ''} placeholder="0" onChange={e => onQuantity(p.sku, Number(e.target.value))} /><button disabled={amount >= available} onClick={() => onQuantity(p.sku, amount + 1)} aria-label={`Sumar selección ${p.sku}`}><Plus size={15} /></button></div>
  </article>; })}</div>;
}
