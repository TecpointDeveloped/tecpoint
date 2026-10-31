import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, ZoomIn, ZoomOut } from 'lucide-react';
import Image from './CatalogImage';
import { productImageFallback } from '@/lib/wholesale-ui/imageFallback';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import styles from '@/styles/wholesale-ui/commerce.module.css';

// Mounted by SKU so changing an option resets its photo and zoom together.
export function ProductGallery({ product }: { product: WholesaleProduct }) {
  const [active, setActive] = useState(0), [zoom, setZoom] = useState(false);
  const images = product.gallery?.length ? product.gallery : [product.image];
  const index = Math.min(active, images.length - 1);
  const missing = images[index]?.includes('isologo');
  const photo = index === 0 && !zoom && !product.image.includes('isologo') ? product.thumbnailLarge || product.thumbnail : images[index];
  function select(index: number) { setActive(index); setZoom(false); }
  return <div className={styles.gallery}><div className={styles.gallerySticky}>
    <span className={styles.galleryBrand}>{product.brand}<small>VISTA DEL PRODUCTO</small></span>
    <button className={`${styles.mainPhoto} ${zoom ? styles.zoomed : ''}`} disabled={missing} onClick={() => setZoom(v => !v)} aria-label={zoom ? 'Reducir imagen' : 'Ampliar imagen'}>
      {missing ? <div className={styles.photoPending}><ImageOff size={38} /><p>Fotografía pendiente</p><small>Consulta las características del producto.</small></div> : <Image src={photo} alt={product.name} width={600} height={600} priority onError={productImageFallback} />}
      {!missing && <span>{zoom ? <ZoomOut size={19} /> : <ZoomIn size={19} />}</span>}
    </button>
    {images.length > 1 && <><div className={styles.photoThumbnails} aria-label="Fotos de este producto">{images.map((src, i) => <button key={src} aria-label={`Ver foto ${i + 1} de ${images.length}`} aria-pressed={index === i} onClick={() => select(i)}><Image src={i === 0 && !product.image.includes('isologo') ? product.thumbnail : src} alt="" width={56} height={56} onError={productImageFallback} /></button>)}</div><div className={styles.galleryControls}><button aria-label="Foto anterior" onClick={() => select((index + images.length - 1) % images.length)}><ChevronLeft size={18} /></button><span aria-live="polite">{index + 1} / {images.length}</span><button aria-label="Foto siguiente" onClick={() => select((index + 1) % images.length)}><ChevronRight size={18} /></button></div></>}
    <small className={styles.galleryNote}>{missing ? 'Imágenes disponibles según el catálogo recibido.' : 'Fotografía del producto · toca para ampliar'}</small>
  </div></div>;
}
