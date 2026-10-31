import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ArrowUpRight, Bookmark, Check, ChevronLeft, ChevronRight, Grid2X2, ImageOff, Layers, Link, List, Minus, Plus, Scale, Search, ShieldCheck, ShoppingBag, Smartphone, SlidersHorizontal, TrendingUp, X } from 'lucide-react';
import Image from './CatalogImage';
import { DeviceExplorer } from '@/components/wholesale-ui/DeviceExplorer';
import { PromotionEntrances } from '@/components/wholesale-ui/PromotionEntrances';
import { BrandSelector } from '@/components/wholesale-ui/BrandSelector';
import { CatalogSearch } from '@/components/wholesale-ui/CatalogSearch';
import { ProductDialog } from '@/components/wholesale-ui/ProductDialog';
import { CompareDialog } from '@/components/wholesale-ui/CompareDialog';
import { OrderDrawer } from '@/components/wholesale-ui/OrderDrawer';
import { QuickOrder } from '@/components/wholesale-ui/QuickOrder';
import { filterWholesaleCatalog, hasOffer, matchesDevice, productFamily, sortProducts, wholesaleFacets, type Filters, type SortOrder } from '@/lib/wholesale-ui/catalogFilters';
import { money } from '@/lib/wholesale-ui/catalogData';
import { displayTitle } from '@/lib/wholesale-ui/productPresentation';
import { CART_KEY, LISTS_KEY, mergeOrder, orderItems, orderTotal, readLists, resolveOrder, type CartLine, type OrderItem, type SavedList } from '@/lib/wholesale-ui/orders';
import type { WholesaleProduct } from '@/lib/wholesale-ui/types';
import { productImageFallback } from '@/lib/wholesale-ui/imageFallback';
import styles from '@/styles/wholesale-ui/catalog.module.css';

const PAGE_SIZE = 24;
function initialFilters(): Filters {
  const p = new URLSearchParams(location.search);
  return { search: p.get('q') || '', category: p.get('category') || '', brand: p.get('brand') || '', manufacturer: p.get('manufacturer') || '', model: p.get('model') || '', classification: p.get('line') || '', liquidation: p.get('liquidation') === '1', offers: p.get('offers') === '1' };
}
function scrollToResults() { requestAnimationFrame(() => document.getElementById('catalog-results')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })); }

export default function Catalog({ allProducts, popularSkus }: { allProducts: WholesaleProduct[]; popularSkus: string[] }) {
  const [filters, setFilters] = useState<Filters>(initialFilters), [sort, setSort] = useState<SortOrder>(() => (['recommended', 'price-asc', 'price-desc', 'name'].includes(new URLSearchParams(location.search).get('sort') || '') ? new URLSearchParams(location.search).get('sort') : 'recommended') as SortOrder), [page, setPage] = useState(() => Math.max(0, Math.min(999, Math.floor(Number(new URLSearchParams(location.search).get('page')) || 1) - 1)));
  const [view, setView] = useState<'grid' | 'quick'>(() => new URLSearchParams(location.search).get('view') === 'quick' ? 'quick' : 'grid');
  const [finderOpen, setFinderOpen] = useState(false);
  const [selected, setSelected] = useState<WholesaleProduct | null>(() => allProducts.find(p => p.sku === new URLSearchParams(location.search).get('sku')) || null);
  const [compareSkus, setCompareSkus] = useState<string[]>([]), [comparisonOpen, setComparisonOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]), [lists, setLists] = useState<SavedList[]>([]), [storageReady, setStorageReady] = useState(false);
  const [drawer, setDrawer] = useState<'cart' | 'lists' | null>(null), [notice, setNotice] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({}), [staged, setStaged] = useState<Record<string, number>>({});
  const noticeTimer = useRef<number>(0);
  const popularTrack = useRef<HTMLDivElement>(null);
  const deferredSearch = useDeferredValue(filters.search || '');
  const facets = useMemo(() => wholesaleFacets(allProducts), [allProducts]);
  const bySku = useMemo(() => new Map(allProducts.map(p => [p.sku, p])), [allProducts]);
  const popularProducts = useMemo(() => popularSkus.flatMap(sku => bySku.get(sku) || []), [popularSkus, bySku]);
  const inCart = useMemo(() => new Map(cart.map(p => [p.sku, p.quantity])), [cart]);
  const scopedProducts = useMemo(() => filterWholesaleCatalog(allProducts, { ...filters, search: '' }), [allProducts, filters]);
  const matches = useMemo(() => sortProducts(filterWholesaleCatalog(scopedProducts, { search: deferredSearch }), sort, deferredSearch), [scopedProducts, sort, deferredSearch]);
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE)), safePage = Math.min(page, pageCount - 1);
  const products = matches.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const comparisons = compareSkus.flatMap(sku => bySku.get(sku) || []);
  const modelProducts = useMemo(() => filters.model ? allProducts.filter(p => matchesDevice(p, filters.manufacturer, filters.model)) : [], [allProducts, filters.manufacturer, filters.model]);
  const visibleBrands = useMemo(() => [...new Set(filterWholesaleCatalog(allProducts, { ...filters, brand: '', search: '' }).map(p => p.brand))].sort(), [allProducts, filters]);
  const manufacturers = useMemo(() => [...new Set(facets.devices.map(d => d.manufacturer))].sort(), [facets]);
  const models = facets.devices.filter(d => d.manufacturer === filters.manufacturer).map(d => d.model).sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));
  const quickItems = useMemo(() => Object.entries(staged).flatMap(([sku, q]) => { const p = bySku.get(sku), available = p ? Math.max(0, p.stock - (inCart.get(sku) || 0)) : 0; return available && q > 0 ? [{ sku, quantity: Math.min(Math.floor(q), available) }] : []; }), [staged, inCart, bySku]);
  const safeStaged = Object.fromEntries(quickItems.map(p => [p.sku, p.quantity]));
  const quickTotal = quickItems.reduce((sum, item) => sum + Math.round((bySku.get(item.sku)?.price || 0) * 100) * item.quantity, 0) / 100;
  const cartUnits = cart.reduce((sum, p) => sum + p.quantity, 0), total = orderTotal(cart);
  const coverPhoto = allProducts.find(p => productFamily(p) === 'covers' && !p.image.includes('isologo'));
  const glassPhoto = allProducts.find(p => productFamily(p) === 'glass' && !p.image.includes('isologo'));
  const activeFilters = Boolean(filters.search || filters.category || filters.brand || filters.manufacturer || filters.model || filters.classification || filters.liquidation || filters.offers);

  function notify(message: string) { window.clearTimeout(noticeTimer.current); setNotice(message); noticeTimer.current = window.setTimeout(() => setNotice(''), 5000); }
  function changeFilters(update: Filters) { setPage(0); setFilters(current => ({ ...current, ...update })); }
  function clearFilters() { setFilters({}); setPage(0); }
  function selectDevice(manufacturer: string, model: string) { if (selected) { history.replaceState(null, '', location.href); setSelected(null); } setFinderOpen(false); setFilters({ manufacturer, model, category: '__accessories' }); setPage(0); scrollToResults(); }
  function setCategory(category: string) { setFilters({ category }); setPage(0); scrollToResults(); }
  function scrollPopular(direction: -1 | 1) {
    const track = popularTrack.current;
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(280, track.clientWidth * .82), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || 'null');
      const items = Array.isArray(saved) ? saved : saved && typeof saved === 'object' ? Object.values(saved) : [];
      setCart(resolveOrder(items, allProducts));
      setLists(readLists(JSON.parse(localStorage.getItem(LISTS_KEY) || '[]')));
    } catch { notify('El almacenamiento de este navegador no está disponible o se reinició. Puedes seguir armando tu pedido.'); }
    setStorageReady(true);
    return () => window.clearTimeout(noticeTimer.current);
  }, [allProducts]);
  useEffect(() => { if (storageReady) { try { localStorage.setItem(CART_KEY, JSON.stringify(orderItems(cart))); } catch { /* The cart remains usable in memory. Saving a named list reports storage failure explicitly. */ } } }, [cart, storageReady]);
  function openProduct(p: WholesaleProduct) {
    history.replaceState({ ...history.state, catalogScroll: window.scrollY }, '', location.href);
    const url = new URL(location.href); url.searchParams.set('sku', p.sku);
    history.pushState({ productOverlay: true }, '', url.pathname + url.search + url.hash);
    setSelected(p);
  }
  function closeProduct() {
    if (history.state?.productOverlay) history.back();
    else setSelected(null);
  }
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search);
      setFilters(initialFilters());
      setSort((['recommended','price-asc','price-desc','name'].includes(params.get('sort') || '') ? params.get('sort') : 'recommended') as SortOrder);
      setPage(Math.max(0, Math.min(999, Math.floor(Number(params.get('page')) || 1) - 1)));
      setView(params.get('view') === 'quick' ? 'quick' : 'grid');
      setSelected(allProducts.find(p => p.sku === params.get('sku')) || null);
      if (!params.get('sku') && Number.isFinite(history.state?.catalogScroll)) requestAnimationFrame(() => window.scrollTo({ top: history.state.catalogScroll, behavior: 'instant' }));
    };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [allProducts]);
  useEffect(() => {
    const url = new URL(location.href);
    for (const [field, parameter] of Object.entries({ search: 'q', category: 'category', brand: 'brand', manufacturer: 'manufacturer', model: 'model', classification: 'line', liquidation: 'liquidation', offers: 'offers' })) { const value = filters[field as keyof Filters]; if (value) url.searchParams.set(parameter, value === true ? '1' : String(value)); else url.searchParams.delete(parameter); }
    if (selected) url.searchParams.set('sku', selected.sku); else url.searchParams.delete('sku');
    for (const [key, value] of [['sort', sort === 'recommended' ? '' : sort], ['page', safePage ? String(safePage + 1) : ''], ['view', view === 'grid' ? '' : view]]) { if (value) url.searchParams.set(key, value); else url.searchParams.delete(key); }
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }, [filters, selected, sort, safePage, view]);

  function addItems(items: OrderItem[]) {
    const next = mergeOrder(cart, items, allProducts);
    const before = cart.reduce((n, p) => n + p.quantity, 0), after = next.reduce((n, p) => n + p.quantity, 0);
    setCart(next);
    notify(after > before ? `${after - before} ${after - before === 1 ? 'unidad agregada' : 'unidades agregadas'} al pedido.` : 'Ya seleccionaste el máximo de unidades del archivo.');
  }
  function addProduct(p: WholesaleProduct, amount = 1) { addItems([{ sku: p.sku, quantity: amount }]); }
  function updateQuantity(sku: string, quantity: number) { setCart(current => resolveOrder(current.map(p => p.sku === sku ? { ...p, quantity } : p), allProducts)); }
  function toggleCompare(p: WholesaleProduct) {
    if (compareSkus.includes(p.sku)) { const next = compareSkus.filter(sku => sku !== p.sku); setCompareSkus(next); if (!next.length) setComparisonOpen(false); }
    else if (compareSkus.length >= 3) notify('Puedes comparar hasta 3 productos. Quita uno para elegir otro.');
    else { setCompareSkus(current => [...current, p.sku]); notify('Producto añadido a la comparación.'); }
  }
  function saveList(name: string) {
    if (!name || !cart.length) return false;
    if (lists.length >= 8) { notify('Ya tienes 8 listas. Elimina una para guardar otra.'); return false; }
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    const next = [{ id, name: name.slice(0, 60), savedAt: new Date().toISOString(), items: orderItems(cart) }, ...lists];
    try { localStorage.setItem(LISTS_KEY, JSON.stringify(next)); setLists(next); notify('Lista guardada en este navegador.'); return true; } catch { notify('No fue posible guardar la lista en este navegador.'); return false; }
  }
  function deleteList(id: string) { const next = lists.filter(l => l.id !== id); try { localStorage.setItem(LISTS_KEY, JSON.stringify(next)); setLists(next); } catch { notify('No fue posible eliminar la lista guardada.'); } }
  function loadList(list: SavedList) {
    const resolved = resolveOrder(list.items, allProducts), next = mergeOrder(cart, orderItems(resolved), allProducts);
    setCart(next);
    const adjusted = list.items.some(item => resolved.find(p => p.sku === item.sku)?.quantity !== item.quantity) || next.reduce((n, p) => n + p.quantity, 0) - cartUnits < resolved.reduce((n, p) => n + p.quantity, 0);
    notify(adjusted ? 'Lista recuperada. Ajustamos productos o cantidades según el catálogo cargado; revisa el pedido.' : 'Lista añadida con los precios del catálogo cargado. Revisa tu pedido.');
  }
  function sendOrder() {
    const fresh = resolveOrder(orderItems(cart), allProducts); setCart(fresh);
    if (!fresh.length) return;
    const body = fresh.map((p, i) => `${i + 1}. ${p.name}\nCódigo: ${p.sku} · Cantidad: ${p.quantity}\nPrecio unitario: ${p.price ? money(p.price) : 'Consultar'} · Subtotal: ${p.price ? money(p.price * p.quantity) : 'Por confirmar'}${p.stock <= 2 ? '\nSolicito precio especial de liquidación.' : ''}`).join('\n\n');
    setDrawer(null);
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent('preview-order-text', { detail: `Hola, deseo cotizar este pedido de mayoreo TECPOINT:\n\n${body}\n\nTotal estimado: ${money(orderTotal(fresh))}\n\nQuedo pendiente de confirmar precios, existencias y el total final.` })));
  }
  async function copySelection() { try { await navigator.clipboard.writeText(location.href); notify('Enlace copiado. Puedes compartir esta selección.'); } catch { notify('Puedes copiar el enlace desde la barra del navegador.'); } }

  return <>
    <a className="skip-link" href="#catalog-results">Saltar al catálogo</a>
    <header className={styles.header}><a href="#" aria-label="TECPOINT · Inicio"><Image src="/tecpoint-catalog-ui/brand/logo-principal.svg" width={174} height={42} alt="TECPOINT" priority /></a><nav aria-label="Navegación principal"><button onClick={() => { setFinderOpen(true); requestAnimationFrame(() => document.getElementById('explorar')?.scrollIntoView({ block: 'start' })); }}>Por teléfono</button><a href="#catalog-results">Catálogo</a><button aria-label="Mis listas guardadas" onClick={() => setDrawer('lists')}><Bookmark size={16} /><span>Mis listas</span></button></nav><span className={styles.headerTag}>CATÁLOGO MAYORISTA</span></header>
    <main className={styles.page}>
      <div className={styles.topSearch}><div className={styles.searchToolbar}><CatalogSearch value={filters.search || ''} onChange={search => changeFilters({ search })} products={scopedProducts} devices={facets.devices} onProduct={openProduct} onDevice={d => selectDevice(d.manufacturer, d.model)} /><button className={styles.listsButton} aria-label="Mis listas guardadas" onClick={() => setDrawer('lists')}><Bookmark size={17} />Mis listas{lists.length > 0 && <b>{lists.length}</b>}</button></div></div>
      <section className={styles.hero}><div className={styles.heroCopy}><span className={styles.heroEyebrow}><i />TU PRÓXIMA REPOSICIÓN EMPIEZA AQUÍ</span><h1>Más opciones.<br /><em>Mejores conexiones</em></h1><p>Encuentra el accesorio correcto, compara marcas y prepara tu pedido con todo a mano.</p><div className={styles.heroActions}><button className={styles.primary} onClick={() => { setFinderOpen(true); requestAnimationFrame(() => document.getElementById('explorar')?.scrollIntoView({ block: 'start' })); }}>Encontrar por teléfono <ArrowRight size={18} /></button><button onClick={() => { setView('quick'); scrollToResults(); }}>Armar un pedido rápido <ArrowUpRight size={16} /></button></div><div className={styles.heroFacts}><span><b>{allProducts.length}</b> productos en un lugar</span><span><b>{facets.brands.length}</b> marcas para elegir</span><span><b>A tu ritmo.</b> Guarda tus listas.</span></div></div><div className={styles.heroScene} aria-hidden="true"><div className={styles.orbit} /><span className={styles.sceneLabel}>PROTEGE. CONECTA. DESTACA.</span>{[coverPhoto, glassPhoto].map((p, i) => p && <div className={`${styles.heroProduct} ${i ? styles.heroProductSecond : ''}`} key={p.sku}><span>{i ? '02 / PROTECCIÓN' : '01 / COBERTORES'}</span><Image src={p.thumbnailLarge || p.thumbnail} width={190} height={210} sizes="(max-width:650px) 135px, 200px" alt="" /><strong>{i ? 'Hecho para encajar.' : 'Tu teléfono. Tu estilo.'}</strong><small>{p.brand}</small></div>)}<span className={styles.scenePill}>TECPOINT · SELECCIÓN MAYORISTA</span></div></section>
      <div className={styles.serviceStrip}><span><Smartphone size={15} />Compatibilidad por modelo</span><span><Scale size={15} />Compara hasta 3 opciones</span><span><Bookmark size={15} />Repite tus listas habituales</span></div>
      {popularProducts.length > 0 && <section className={styles.popular} aria-labelledby="popular-title">
        <header className={styles.popularHeader}><div><span><TrendingUp size={15} /> BASADO EN VENTAS REALES</span><h2 id="popular-title">Productos populares</h2><p>Los favoritos de nuestros clientes mayoristas.</p></div><div className={styles.popularControls}><button type="button" onClick={() => scrollPopular(-1)} aria-label="Ver productos populares anteriores"><ChevronLeft size={20} /></button><button type="button" onClick={() => scrollPopular(1)} aria-label="Ver más productos populares"><ChevronRight size={20} /></button></div></header>
        <div className={styles.popularTrack} ref={popularTrack}>{popularProducts.map((product, index) => <article className={styles.popularCard} key={product.sku}><button type="button" className={styles.popularImage} onClick={() => openProduct(product)} aria-label={`Ver ${product.name}`}><span>#{index + 1}</span>{product.image.includes('isologo') ? <div className={styles.missingPhoto}><ImageOff size={27} /><span>Fotografía pendiente</span></div> : <Image src={product.thumbnailLarge || product.thumbnail} alt={product.name} width={260} height={260} sizes="(max-width:650px) 72vw, 240px" onError={productImageFallback} />}</button><div className={styles.popularBody}><small>{product.brand}</small><h3><button type="button" onClick={() => openProduct(product)}>{displayTitle(product.name, product.brand).title}</button></h3><strong>{product.price ? money(product.price) : 'Consultar'}</strong><button type="button" disabled={!product.stock} onClick={() => addProduct(product)}>Agregar <Plus size={15} /></button></div></article>)}</div>
      </section>}
      <details className={styles.phoneFinder} open={finderOpen} onToggle={e => setFinderOpen(e.currentTarget.open)}><summary><Smartphone size={21} /><span><strong>Encuentra lo que le queda a tu teléfono</strong><small>Cobertores y vidrios · marca y modelo</small></span><Plus size={20} /></summary><DeviceExplorer products={allProducts} category={filters.category || ''} manufacturer={filters.manufacturer || ''} model={filters.model || ''} onSelect={(family, manufacturer, model) => { setFilters({ category: '__' + family, manufacturer, model }); setPage(0); if (model) { setFinderOpen(false); scrollToResults(); } }} /></details>
      <nav className={styles.categoryNav} aria-label="Otras categorías"><span>También para tu negocio</span>{[['Carga y cables', 'Cables y Cargadores'], ['Audio', 'Audio']].map(([label, category]) => <button key={label} onClick={() => setCategory(category)}>{label}<ArrowUpRight size={14} /></button>)}<button onClick={() => { clearFilters(); scrollToResults(); }}>Todos los productos <ArrowRight size={14} /></button></nav>
      <PromotionEntrances products={allProducts} selected={filters.offers ? 'offers' : filters.liquidation ? 'liquidation' : ''} onSelect={selection => { setFilters(current => current[selection] ? {} : { [selection]: true }); setPage(0); scrollToResults(); }} />
      <section className={styles.catalog} id="catalog-results" aria-labelledby="catalog-title">
        {filters.model ? <div className={styles.modelHero}><div className={styles.modelSymbol}><Smartphone size={34} /></div><div><span className={styles.eyebrow}>TU SELECCIÓN POR TELÉFONO</span><h2 id="catalog-title">Todo para tu {filters.model}.</h2><p>{filters.manufacturer} · {modelProducts.length} opciones según el archivo</p></div><button className={styles.shareButton} aria-label="Copiar selección" onClick={copySelection}><Link size={16} /><span>Copiar selección</span></button><div className={styles.modelTabs} aria-label="Accesorios de este modelo">{[['__accessories', 'Todos', modelProducts.length], ['__covers', 'Cobertores', modelProducts.filter(p => productFamily(p) === 'covers').length], ['__glass', 'Vidrios y protección', modelProducts.filter(p => productFamily(p) === 'glass').length]].map(([value, label, count]) => <button key={value} aria-pressed={filters.category === value || (!filters.category && value === '__accessories')} onClick={() => changeFilters({ category: String(value), brand: '', classification: '', search: '', liquidation: false, offers: false })}>{label}<b>{count}</b></button>)}</div></div> : <div className={styles.collectionHeading}><span className={styles.eyebrow}>LA SELECCIÓN TECPOINT</span><h2 id="catalog-title">{filters.category === '__covers' ? 'Protección con personalidad.' : filters.category === '__glass' ? 'Cada pantalla, bien protegida.' : filters.liquidation ? 'Últimas unidades. Nuevas oportunidades.' : filters.offers ? 'Ofertas para tu próxima reposición.' : 'Encuentra tu próximo favorito.'}</h2><p>{filters.liquidation ? 'Selecciona tus productos y consulta el precio especial de liquidación con mayoreo.' : filters.offers ? 'El precio anterior, el precio actual y tu ahorro, juntos en cada producto.' : 'Explora, compara y arma una selección a la medida de tu negocio.'}</p></div>}

        <div className={styles.filterBar}><details><summary><SlidersHorizontal size={16} />Filtros <Plus size={14} /></summary><div className={styles.filterFields}><label>Categoría<select value={filters.category || ''} onChange={e => changeFilters({ category: e.target.value, manufacturer: '', model: '', brand: '', classification: '' })}><option value="">Todas</option><option value="__accessories">Todos por teléfono</option><option value="__covers">Cobertores</option><option value="__glass">Vidrios y protección</option>{facets.categories.map(c => <option key={c}>{c}</option>)}</select></label><label>Marca del teléfono<select value={filters.manufacturer || ''} onChange={e => changeFilters({ manufacturer: e.target.value, model: '' })}><option value="">Todas</option>{manufacturers.map(m => <option key={m}>{m}</option>)}</select></label><label>Modelo<select disabled={!filters.manufacturer} value={filters.model || ''} onChange={e => changeFilters({ model: e.target.value })}><option value="">Todos</option>{models.map(m => <option key={m}>{m}</option>)}</select></label><label>Línea<select value={filters.classification || ''} onChange={e => changeFilters({ classification: e.target.value })}><option value="">Todas</option>{facets.classifications.map(c => <option key={c}>{c}</option>)}</select></label></div></details><button aria-pressed={Boolean(filters.liquidation)} onClick={() => changeFilters({ liquidation: !filters.liquidation, offers: false })}>Liquidación</button><button aria-pressed={Boolean(filters.offers)} onClick={() => changeFilters({ offers: !filters.offers, liquidation: false })}>Ofertas</button>{activeFilters && <button className={styles.clearFilters} onClick={clearFilters}>Limpiar filtros <X size={13} /></button>}</div>
        <BrandSelector brands={visibleBrands} selected={filters.brand || ''} onSelect={brand => changeFilters({ brand })} />
        <div className={styles.resultsToolbar}><div><strong id="result-heading" tabIndex={-1} aria-live="polite">{matches.length} {matches.length === 1 ? 'producto' : 'productos'}</strong><span>{filters.search ? `Resultados para “${filters.search}”` : filters.model ? 'Todas las marcas, un mismo modelo.' : 'Precios mayoristas en lempiras.'}</span></div><label className={styles.sort}><span className="sr-only">Ordenar productos</span><select aria-label="Ordenar productos" value={sort} onChange={e => { setSort(e.target.value as SortOrder); setPage(0); }}><option value="recommended">Destacados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre A–Z</option></select></label><div className={styles.viewToggle} aria-label="Vista del catálogo"><button aria-pressed={view === 'grid'} onClick={() => setView('grid')}><Grid2X2 size={16} /><span>Galería</span></button><button aria-pressed={view === 'quick'} onClick={() => setView('quick')}><List size={17} /><span>Pedido rápido</span></button></div></div>
        {view === 'quick' && <div className={styles.quickIntro}><Layers size={18} /><p>Escribe las cantidades de varios productos y agrégalos juntos. Tu selección se conserva al cambiar de página.</p></div>}
        <div className={styles.results} aria-busy={deferredSearch !== (filters.search || '')}>
        {products.length ? view === 'quick' ? <QuickOrder products={products} quantities={safeStaged} inCart={inCart} onQuantity={(sku, q) => { const p = bySku.get(sku); if (!p) return; setStaged(current => ({ ...current, [sku]: Math.max(0, Math.min(p.stock - (inCart.get(sku) || 0), Number.isFinite(q) ? Math.floor(q) : 0)) })); }} onProduct={openProduct} /> : <div className={styles.grid}>{products.map(p => { const presentation = displayTitle(p.name, p.brand); const remaining = Math.max(0, p.stock - (inCart.get(p.sku) || 0)), quantity = Math.min(quantities[p.sku] || 1, Math.max(1, remaining)), compared = compareSkus.includes(p.sku); return <article className={styles.card} key={p.sku}><div className={styles.productStage}><button className={styles.productImage} onClick={() => openProduct(p)} aria-label={`Ver ${p.name}`}>{p.image.includes('isologo') ? <div className={styles.missingPhoto}><ImageOff size={27} /><span>Fotografía pendiente</span></div> : <Image src={p.thumbnail} alt={p.name} width={320} height={320} sizes="(max-width:650px) 45vw, (max-width:1100px) 29vw, 22vw" onError={productImageFallback} />}</button><button className={`${styles.comparePick} ${compared ? styles.comparePicked : ''}`} aria-pressed={compared} aria-label={`Comparar ${p.name}`} onClick={() => toggleCompare(p)}>{compared ? <Check size={16} /> : <Scale size={16} />}</button>{hasOffer(p) && <span className={styles.offerBadge}>−{p.discountPercent}%</span>}{inCart.get(p.sku) ? <span className={styles.inCart}><Check size={12} />{inCart.get(p.sku)} en tu pedido</span> : null}</div><div className={styles.cardBody}><span className={styles.brand}>{p.brand}</span><h3><button onClick={() => openProduct(p)} aria-label={p.name} title={p.name}>{presentation.title}</button></h3>{presentation.variant && <span className={styles.variant}>{presentation.variant}</span>}<small className={styles.sku}>{p.sku}</small><div className={styles.price}><span>MAYOREO</span>{hasOffer(p) && <del>{money(p.originalPrice!)}</del>}<strong>{p.price ? money(p.price) : 'Consultar'}</strong>{hasOffer(p) && <small>Ahorras {money(p.originalPrice! - p.price!)}</small>}</div><div className={styles.retail}><span>Detalle</span><b>{p.retailPrice ? money(p.retailPrice) : 'Consultar'}</b></div><span className={styles.stock}>{p.stock <= 2 ? `Liquidación · ${p.stock} en archivo` : `${p.stock} unidades en archivo`}</span><div className={styles.cardOrder}><div className={styles.quantity}><button aria-label={`Restar cantidad ${p.sku}`} disabled={quantity <= 1} onClick={() => setQuantities(q => ({ ...q, [p.sku]: quantity - 1 }))}><Minus size={14} /></button><input type="number" inputMode="numeric" aria-label={`Cantidad ${p.sku}`} min="1" max={Math.max(1, remaining)} value={quantity} onChange={e => setQuantities(q => ({ ...q, [p.sku]: Math.max(1, Math.min(remaining, Math.floor(Number(e.target.value)) || 1)) }))} /><button aria-label={`Sumar cantidad ${p.sku}`} disabled={quantity >= remaining} onClick={() => setQuantities(q => ({ ...q, [p.sku]: quantity + 1 }))}><Plus size={14} /></button></div><button className={styles.addProduct} disabled={!remaining} onClick={() => addProduct(p, quantity)}>{remaining ? <>Agregar <Plus size={16} /></> : <><Check size={16} />Máximo añadido</>}</button></div></div></article>; })}</div> : <div className={styles.empty}><Search size={36} /><h3>{filters.offers ? 'No hay ofertas activas con estos filtros.' : 'No encontramos esa combinación.'}</h3><p>{filters.offers ? 'Estamos preparando las próximas promociones. Vuelve pronto o consulta con mayoreo.' : 'Prueba otro modelo, elimina una marca o busca por código de producto.'}</p><button className={styles.primary} onClick={clearFilters}>Ver todo el catálogo <ArrowRight size={17} /></button></div>}
        </div>
        {matches.length > PAGE_SIZE && <nav className={styles.pagination} aria-label="Páginas del catálogo"><button disabled={!safePage} onClick={() => { setPage(safePage - 1); scrollToResults(); }}><ChevronLeft size={16} /><span>Anterior</span></button><span>Página <b>{safePage + 1}</b> de {pageCount}<small>{safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, matches.length)} de {matches.length} productos</small></span><button disabled={safePage + 1 >= pageCount} onClick={() => { setPage(safePage + 1); scrollToResults(); }}><span>Siguiente</span><ChevronRight size={16} /></button></nav>}
        <p className={styles.dataNote}><ShieldCheck size={14} />Compatibilidades según el archivo recibido. Precios y disponibilidad sujetos a confirmación.</p>
      </section>
      <footer className={styles.footer}><Image src="/tecpoint-catalog-ui/brand/logo-principal.svg" alt="TECPOINT" width={140} height={34} /><div><h2>Mayoreo y Pick Up</h2><p>San Pedro Sula · Barrio Los Andes, 7 calle, 14 avenida.</p><p>Precios, existencias y condiciones de mayoreo: confirma con el asesor.</p><a href="https://wa.me/50498191003" target="_blank" rel="noopener noreferrer">Consultar con mayoreo ↗</a></div><nav aria-label="Información de TECPOINT"><a href="https://tecpoint.ws/garantia" target="_blank" rel="noopener noreferrer">Garantía</a><a href="https://tecpoint.ws/preguntas-frecuentes" target="_blank" rel="noopener noreferrer">Envíos y preguntas frecuentes</a><a href="#catalog-results">Volver al catálogo ↑</a></nav></footer>
    </main>
    {notice && createPortal(<div className={styles.toast} role="status"><Check size={17} /><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={16} /></button></div>, Array.from(document.querySelectorAll('dialog[open]')).at(-1) || document.body)}
    <div className={styles.bottomDock}>
      {quickItems.length > 0 && <div className={styles.batchBar}><div><strong>{quickItems.length} {quickItems.length === 1 ? 'referencia seleccionada' : 'referencias seleccionadas'}</strong><span>{money(quickTotal)} estimados</span></div><button onClick={() => { addItems(quickItems); setStaged({}); }}>Agregar selección <Plus size={17} /></button><button className={styles.batchClear} onClick={() => setStaged({})} aria-label="Limpiar selección rápida"><X size={18} /></button></div>}
      <div className={styles.dockActions}>{compareSkus.length > 0 && <button className={styles.compareDock} onClick={() => setComparisonOpen(true)} disabled={compareSkus.length < 2}><Scale size={18} /><span>Comparar ({compareSkus.length}/3){compareSkus.length === 1 && <small>Elige otra opción</small>}</span></button>}<button className={styles.cartDock} onClick={() => setDrawer('cart')}><ShoppingBag size={18} /><span>{cartUnits ? `Mi pedido · ${cartUnits} ${cartUnits === 1 ? 'unidad' : 'unidades'}` : 'Mi pedido'}<b>{cartUnits ? money(total) : 'Empieza tu selección'}</b></span><ArrowRight size={19} /></button></div>
    </div>
    {selected && <ProductDialog product={selected} products={allProducts} onSelect={setSelected} onClose={closeProduct} onAdd={p => addProduct(p)} onCompare={toggleCompare} compared={compareSkus.includes(selected.sku)} onDevice={selectDevice} />}
    {comparisonOpen && comparisons.length > 0 && <CompareDialog products={comparisons} onClose={() => setComparisonOpen(false)} onRemove={sku => toggleCompare(bySku.get(sku)!)} onAdd={p => addProduct(p)} />}
    {drawer && <OrderDrawer key={drawer} cart={cart} lists={lists} startTab={drawer} onClose={() => setDrawer(null)} onQuantity={updateQuantity} onClear={() => { setCart([]); notify('Pedido vaciado. Tus listas guardadas se conservan.'); }} onSave={saveList} onLoad={loadList} onDelete={deleteList} onSend={sendOrder} />}
  </>;
}
