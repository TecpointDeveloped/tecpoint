import { Plus, X, ImageOff } from 'lucide-react';
import Image from './CatalogImage';
import { NativeDialog } from './NativeDialog';
import { money } from '@/lib/wholesale-ui/catalogData';
import { titleFacts, displayTitle } from '@/lib/wholesale-ui/productPresentation';
import { productImageFallback } from '@/lib/wholesale-ui/imageFallback';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import styles from '@/styles/wholesale-ui/commerce.module.css';
export function CompareDialog({ products, onClose, onRemove, onAdd }: { products: WholesaleProduct[]; onClose: () => void; onRemove: (sku: string) => void; onAdd: (p: WholesaleProduct) => void }) {
  const facts = new Map(products.map(p => [p.sku, { ...titleFacts(p.name), ...p.specifications }]));
  const fields = [...new Set([...facts.values()].flatMap(Object.keys))];
  const rows: [string, (p: WholesaleProduct) => string][] = [
    ['Mayoreo', p => p.price ? money(p.price) : 'Consultar'], ['Detalle', p => p.retailPrice ? money(p.retailPrice) : 'Consultar'],
    ['Categoría', p => p.category], ['Línea', p => p.classification || 'Consultar'],
    ['Compatibilidad del archivo', p => p.devices.length ? p.devices.map(d => `${d.manufacturer} ${d.model}`).join(' · ') : 'Consultar'],
    ...fields.map(key => [key, (p: WholesaleProduct) => facts.get(p.sku)?.[key] || 'No indicado'] as [string, (p: WholesaleProduct) => string]),
    ['Existencias del archivo', p => `${p.stock} ${p.stock === 1 ? 'unidad' : 'unidades'}`], ['Código', p => p.sku]
  ];
  const photo = (p: WholesaleProduct) => p.image.includes('isologo') ? <div className={styles.compareMissing}><ImageOff size={30} /><small>Foto pendiente</small></div> : <Image src={p.thumbnail} width={140} height={130} sizes="140px" alt={p.name} onError={productImageFallback} />;
  return <NativeDialog label="comparison-title" onClose={onClose}>
    <header className={styles.modalHeading}><div><span className={styles.eyebrow}>ELIGE CON MÁS CLARIDAD</span><h2 id="comparison-title">Compara tus opciones.</h2><p>Revisa precios, variantes y compatibilidad.</p></div><button className={styles.iconButton} onClick={onClose} aria-label="Cerrar comparación"><X size={22} /></button></header>
    <div className={styles.comparisonScroll}><table className={styles.comparison}><caption className="sr-only">Comparación de {products.length} productos seleccionados</caption><thead><tr><th scope="col">Producto</th>{products.map(p => <th scope="col" key={p.sku}><button className={styles.removeCompare} onClick={() => onRemove(p.sku)} aria-label={`Quitar ${p.name} de la comparación`}><X size={15} /></button>{photo(p)}<small>{p.brand}</small><strong>{p.name}</strong></th>)}</tr></thead><tbody>
      {rows.map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{products.map(p => <td key={p.sku}>{value(p)}</td>)}</tr>)}
      <tr><th scope="row">Tu elección</th>{products.map(p => <td key={p.sku}><button className={styles.primary} onClick={() => onAdd(p)}><Plus size={16} />Agregar</button></td>)}</tr>
    </tbody></table></div>
    <div className={styles.mobileComparison}>{products.map((p, index) => <article key={p.sku}>
      <header><span>OPCIÓN {index + 1} · {p.brand}</span><button className={styles.iconButton} onClick={() => onRemove(p.sku)} aria-label={`Quitar ${p.name} de la comparación`}><X size={18} /></button></header>
      <div className={styles.mobileCompareProduct}>{photo(p)}<h3>{displayTitle(p.name, p.brand).title}</h3></div>
      <dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value(p)}</dd></div>)}</dl>
      <button className={styles.primary} onClick={() => onAdd(p)}><Plus size={16} />Agregar al pedido</button>
    </article>)}</div>
    <p className={styles.modalFootnote}>Datos del archivo recibido. Confirma compatibilidad y disponibilidad con el asesor.</p>
  </NativeDialog>;
}
