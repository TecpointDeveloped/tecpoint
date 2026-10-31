import { useEffect, useState } from 'react';
import { ArrowRight, Check, Plus, Scale, Smartphone, X } from 'lucide-react';
import { NativeDialog } from './NativeDialog';
import { ProductOptions } from './ProductOptions';
import { ProductGallery } from './ProductGallery';
import { getProductDetail, money } from '@/lib/wholesale-ui/catalogData';
import { hasOffer } from '@/lib/wholesale-ui/catalogFilters';
import { displayTitle } from '@/lib/wholesale-ui/productPresentation';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import styles from '@/styles/wholesale-ui/commerce.module.css';
export function ProductDialog({ product, products, onSelect, onClose, onAdd, onCompare, compared, onDevice }: { product: WholesaleProduct; products: WholesaleProduct[]; onSelect: (p: WholesaleProduct) => void; onClose: () => void; onAdd: (p: WholesaleProduct) => void; onCompare: (p: WholesaleProduct) => void; compared: boolean; onDevice: (manufacturer: string, model: string) => void }) {
  const [loaded, setLoaded] = useState(product), [state, setState] = useState('loading'), [loadedSku, setLoadedSku] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => { let live = true; setState('loading'); setLoadedSku(product.sku); getProductDetail(product).then(p => { if (live) { setLoaded(p); setState('ready'); } }).catch(() => { if (live) setState('error'); }); return () => { live = false; }; }, [product, retry]);
  // Never render the previous option's photo, description or price during a fetch.
  const detail = loaded.sku === product.sku ? loaded : product;
  const detailState = loadedSku === product.sku ? state : 'loading';
  const title = displayTitle(detail.name, detail.brand).title.replace(/\b(con)\s+\1\b/gi, '$1').replace(/^(?:Forro|Cobertor|Funda)\s+/i, '');
  return <NativeDialog onClose={onClose} label="product-title">
    <button className={styles.close} onClick={onClose} aria-label="Cerrar ficha"><X size={21} /></button>
    <div className={styles.productDetail}>
      <ProductGallery key={product.sku} product={detail} />
      <div className={styles.detailCopy}>
        <span className={styles.eyebrow}>{detail.brand} / {detail.sku}</span>
        <h2 id="product-title">{title}</h2>
        <span className={styles.availability}><i />{detail.stock} {detail.stock === 1 ? 'unidad' : 'unidades'} en el archivo recibido</span>
        <div className={styles.detailPrice}><span>PRECIO MAYORISTA</span>{hasOffer(detail) && <div className={styles.promo}><b>−{detail.discountPercent}%</b><del>{money(detail.originalPrice!)}</del></div>}<strong>{detail.price ? money(detail.price) : 'Consultar'}</strong>{hasOffer(detail) && <small>Ahorras {money(detail.originalPrice! - detail.price!)} por unidad</small>}</div>
        <div className={styles.otherPrices}><div><span>Precio al detalle</span><b>{detail.retailPrice ? money(detail.retailPrice) : 'Consultar'}</b></div><div><span>Precio de reventa</span><b>Consultar con asesor</b></div></div>
        <ProductOptions products={products} product={product} onSelect={onSelect} />
        <div className={styles.detailActions}><button className={styles.primary} onClick={() => onAdd(product)} disabled={product.stock < 1}><Plus size={18} />Agregar al pedido</button><button className={styles.secondary} aria-pressed={compared} onClick={() => onCompare(product)}>{compared ? <Check size={16} /> : <Scale size={16} />}{compared ? 'En comparación' : 'Comparar'}</button></div>
        <button className={styles.productLink} onClick={() => window.dispatchEvent(new CustomEvent('preview-order-text', { detail: `Hola, quiero consultar ${product.stock <= 2 ? 'el precio especial de liquidación y ' : ''}el precio de reventa de ${product.name} (código ${product.sku}).` }))}>Consultar este producto →</button>
        <section className={styles.detailSection}><h3>Conoce el producto</h3>{detailState === 'loading' ? <p role="status">Cargando características…</p> : detailState === 'error' ? <p>No se pudieron cargar las características. <button onClick={() => setRetry(v => v + 1)}>Reintentar</button></p> : <><p>{detail.description || 'La descripción detallada está pendiente en el catálogo recibido.'}</p><dl>{[['Categoría', detail.category], ['Línea', detail.classification || detail.subcategory], ...Object.entries(detail.specifications), ['UPC', detail.upc]].filter(([, value]) => value).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><small className={styles.factsNote}>Datos presentes en el nombre y la ficha del archivo recibido. Confirma las especificaciones completas con el asesor.</small></>}</section>
        <section className={styles.detailSection}><h3><Smartphone size={16} />Compatibilidad del archivo</h3>{detail.devices.length ? detail.devices.map(d => <button className={styles.deviceLink} key={`${d.manufacturer}-${d.model}`} onClick={() => { onDevice(d.manufacturer, d.model); }}>{d.manufacturer} {d.model}<ArrowRight size={15} /></button>) : <p>Este producto no tiene modelos asociados en el archivo. Consulta compatibilidad antes de pedir.</p>}</section>
        <a className={styles.productLink} href={`/mayoreo/catalogo?sku=${encodeURIComponent(product.sku)}`}>Abrir enlace directo al producto ↗</a>
      </div>
    </div>
  </NativeDialog>;
}
