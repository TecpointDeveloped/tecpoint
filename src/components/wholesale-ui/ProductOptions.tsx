import { useMemo, useState } from 'react';
import { Check, ChevronDown, ImageOff } from 'lucide-react';
import Image from './CatalogImage';
import { accessoryDevices, accessoryOptions, deviceKey, optionLabel } from '@/lib/wholesale-ui/productOptions';
import { productFamily } from '@/lib/wholesale-ui/catalogFilters';
import { money } from '@/lib/wholesale-ui/catalogData';
import { productImageFallback } from '@/lib/wholesale-ui/imageFallback';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import styles from '@/styles/wholesale-ui/options.module.css';

export function ProductOptions({ products, product, onSelect }: { products: WholesaleProduct[]; product: WholesaleProduct; onSelect: (p: WholesaleProduct) => void }) {
  const [chosenDevice, setChosenDevice] = useState(''), [expanded, setExpanded] = useState(false);
  const devices = useMemo(() => accessoryDevices(products, product), [products, product]);
  const device = product.devices.find(d => deviceKey(d) === chosenDevice) || product.devices[0];
  const options = useMemo(() => device ? accessoryOptions(products, product, device) : [], [products, product, device]);
  if (!device || !devices.length) return null;
  const brands = [...new Set(options.map(p => p.brand))];
  const choices = options.filter(p => p.brand === product.brand);
  // Keep the current selection visible even when opened through a direct SKU link.
  const firstOptions = choices.slice(0, 6);
  const visible = expanded ? choices : firstOptions.some(p => p.sku === product.sku) ? firstOptions : [...choices.slice(0, 5), product];
  const manufacturers = [...new Set(devices.map(d => d.manufacturer))];
  const selection = optionLabel(product, device);
  return <section className={styles.options} aria-label="Configurar accesorio">
    <div className={styles.stepHeading}><span>01</span><label htmlFor="accessory-device">Modelo del teléfono</label></div>
    <div className={styles.selectWrap}><select id="accessory-device" value={deviceKey(device)} onChange={e => {
      const nextDevice = devices.find(d => deviceKey(d) === e.target.value);
      if (!nextDevice) return;
      const available = accessoryOptions(products, product, nextDevice);
      const next = available.find(p => p.brand === product.brand) || available[0];
      if (next) { setChosenDevice(deviceKey(nextDevice)); setExpanded(false); onSelect(next); }
    }}>{manufacturers.map(manufacturer => <optgroup key={manufacturer} label={manufacturer}>{devices.filter(d => d.manufacturer === manufacturer).map(d => <option key={deviceKey(d)} value={deviceKey(d)}>{d.manufacturer} · {d.model}</option>)}</optgroup>)}</select><ChevronDown size={17} aria-hidden="true" /></div>
    <div className={styles.stepHeading}><span>02</span><h3>Marca del accesorio</h3></div>
    <div className={styles.brandChoices} aria-label="Marcas compatibles">{brands.map(brand => <button key={brand} aria-pressed={brand === product.brand} onClick={() => { const next = options.find(p => p.brand === brand); if (next) { setExpanded(false); onSelect(next); } }}>{brand}{brand === product.brand && <Check size={14} />}</button>)}</div>
    <div className={styles.stepHeading}><span>03</span><h3>{productFamily(product) === 'covers' ? 'Diseño y color' : 'Tipo de protección'}</h3><small>{choices.length} {choices.length === 1 ? 'opción' : 'opciones'}</small></div>
    <p className={styles.selectedLabel} aria-live="polite">{selection.design}{selection.variant && <> · <b>{selection.variant}</b></>}</p>
    <div className={styles.optionGrid} aria-label="Opciones del accesorio">{visible.map(p => {
      const label = optionLabel(p, device);
      return <button key={p.sku} className={styles.option} aria-pressed={p.sku === product.sku} aria-label={`Elegir ${p.name}, código ${p.sku}`} onClick={() => onSelect(p)}>
        <span className={styles.optionPhoto}>{p.image.includes('isologo') ? <span className={styles.noPhoto}><ImageOff size={22} /><small>Sin foto</small></span> : <Image src={p.thumbnail} alt="" width={92} height={80} sizes="110px" onError={productImageFallback} />}{p.sku === product.sku && <i><Check size={12} /></i>}</span>
        <span className={styles.optionName}>{label.design}</span>{label.variant && <span className={styles.optionVariant}>{label.variant}</span>}<b>{p.price ? money(p.price) : 'Consultar'}</b>
      </button>;
    })}</div>
    {choices.length > 6 && <button className={styles.expand} onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>{expanded ? 'Ver menos opciones' : `Ver las ${choices.length} opciones`}<ChevronDown size={15} /></button>}
    <p className={styles.compatibilityNote}>Cada opción corresponde a un producto del catálogo para <strong>{device.manufacturer} {device.model}</strong>.</p>
  </section>;
}
