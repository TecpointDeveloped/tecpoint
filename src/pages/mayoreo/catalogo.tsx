import Head from "next/head";
import Image from "next/image";
import {
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { productImageFallback } from "@/lib/imageFallback";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";
import {
  wholesaleCatalog,
  wholesaleFacets,
  type WholesaleProduct,
} from "@/lib/wholesaleCatalog";
import styles from "@/styles/wholesaleCatalog.module.css";

type CartLine = WholesaleProduct & { quantity: number };

type Props = {
  initialProducts: WholesaleProduct[];
  initialTotal: number;
  brands: string[];
  categories: string[];
};

const CART_KEY = "tecpoint_wholesale_cart_v1";
const PAGE_SIZE = 36;

const BRAND_LOGOS: Record<string, string> = {
  appacs: "/logos/appacs.png",
  apple: "/logos/apple.png",
  coast: "/logos/coast.jpg",
  deken: "/logos/deken.png",
  ghostek: "/logos/ghostek.png",
  hoco: "/logos/hoco.png",
  hypergear: "/logos/hypergear.webp",
  krieg: "/logos/krieg.png",
  langsdom: "/logos/langsdom.png",
  naztech: "/logos/naztech.png",
  powerpeak: "/logos/powepeak.png",
  "rock space": "/logos/rock-space.png",
  samsung: "/logos/samsung.png",
  usg: "/logos/usg.png",
  xbase: "/logos/xbase.png",
  xo: "/logos/xo.png",
};

function brandLogo(name: string) {
  return BRAND_LOGOS[name.trim().toLowerCase()] || null;
}

export async function getServerSideProps({ res }: { res: { setHeader: (name:string,value:string)=>void } }) {
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  const allProducts = wholesaleCatalog();
  const facets = wholesaleFacets(allProducts);
  return {
    props: {
      initialProducts: allProducts.slice(0, PAGE_SIZE),
      initialTotal: allProducts.length,
      ...facets,
    },
  };
}

function money(value: number) {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function WholesaleCatalog({ initialProducts, initialTotal, brands, categories }: Props) {
  const { wholesaleWhatsApp } = useSiteConfig();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  const [notice, setNotice] = useState("");
  const firstRequest = useRef(true);
  const featuredRockSpace = brands.find((item) => item.toLowerCase().replace(/\s+/g, "") === "rockspace");
  const orderedBrands = featuredRockSpace
    ? [featuredRockSpace, ...brands.filter((item) => item !== featuredRockSpace)]
    : brands;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      window.localStorage.removeItem(CART_KEY);
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    if (firstRequest.current && !search && !brand && !category) {
      firstRequest.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search, brand, category, offset: "0", limit: String(PAGE_SIZE) });
        const response = await fetch(`/api/wholesale-catalog?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("No fue posible actualizar el catálogo.");
        const data = await response.json();
        setProducts(data.products);
        setTotal(data.total);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setNotice("No fue posible actualizar los productos. Intente nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [brand, category, search]);

  const cartLines = useMemo(() => Object.values(cart), [cart]);
  const cartQuantity = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const cartTotal = cartLines.reduce(
    (sum, line) => sum + (line.price || 0) * line.quantity,
    0,
  );

  function selectedQuantity(product: WholesaleProduct) {
    return Math.max(1, quantities[product.sku] || 1);
  }

  function setProductQuantity(product: WholesaleProduct, value: number) {
    const safeValue = Math.max(1, Math.min(product.stock, Math.floor(value || 1)));
    setQuantities((current) => ({ ...current, [product.sku]: safeValue }));
  }

  function addProduct(product: WholesaleProduct) {
    const quantity = selectedQuantity(product);
    setCart((current) => {
      const existing = current[product.sku];
      const nextQuantity = Math.min(
        product.stock,
        (existing?.quantity || 0) + quantity,
      );
      return {
        ...current,
        [product.sku]: { ...product, quantity: nextQuantity },
      };
    });
    setNotice(`${product.name} se agregó al pedido.`);
    setDrawerOpen(true);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function updateCartQuantity(sku: string, value: number) {
    setCart((current) => {
      const line = current[sku];
      if (!line) return current;
      if (value <= 0) {
        const next = { ...current };
        delete next[sku];
        return next;
      }
      return {
        ...current,
        [sku]: {
          ...line,
          quantity: Math.min(line.stock, Math.max(1, Math.floor(value))),
        },
      };
    });
  }

  function clearFilters() {
    setSearch("");
    setBrand("");
    setCategory("");
  }

  async function loadMore() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, brand, category, offset: String(products.length), limit: String(PAGE_SIZE) });
      const response = await fetch(`/api/wholesale-catalog?${params}`);
      if (!response.ok) throw new Error("No fue posible cargar más productos.");
      const data = await response.json();
      setProducts((current) => [...current, ...data.products]);
      setTotal(data.total);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No fue posible cargar más productos.");
    } finally {
      setLoading(false);
    }
  }

  function whatsappOrder() {
    if (!cartLines.length) return "#";
    const detail = cartLines
      .map((line, index) => {
        const unitPrice = line.price ? money(line.price) : "Consultar precio";
        const subtotal = line.price
          ? money(line.price * line.quantity)
          : "Por confirmar";
        return `${index + 1}. ${line.name}\n   Código: ${line.sku}\n   Cantidad: ${line.quantity}\n   Precio unitario: ${unitPrice}\n   Subtotal: ${subtotal}`;
      })
      .join("\n\n");
    const message = `Hola, deseo realizar el siguiente pedido de mayoreo TECPOINT:\n\n${detail}\n\nTotal estimado: ${money(cartTotal)}\n\nQuedo pendiente de confirmación de disponibilidad y total final.`;
    return whatsappLink(wholesaleWhatsApp, message);
  }

  return (
    <>
      <Head>
        <title>Catálogo Mayoreo | TECPOINT</title>
        <meta
          name="description"
          content="Catálogo exclusivo para clientes mayoristas TECPOINT."
        />
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <link rel="canonical" href="https://tecpoint.ws/mayoreo/catalogo" />
      </Head>
      <header className={styles.wholesaleHeader}>
        <Image src="/brand/logo-principal.svg" alt="TECPOINT" width={180} height={42} priority />
        <span>Tienda de mayoreo</span>
      </header>
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span>TECPOINT · CATÁLOGO MAYORISTA</span>
            <h1>Tu negocio merece<br />más opciones.</h1>
            <p>Busca lo que necesitas, elige cantidades y arma tu pedido en minutos.</p>
            {featuredRockSpace && (
              <button className={styles.featuredBrand} type="button" onClick={() => { setBrand(featuredRockSpace); setCategory(""); setSearch(""); }}>
                <Image src="/logos/rock-space.png" alt="" width={116} height={42} />
                <span>Comprar Rock Space <span aria-hidden="true">→</span></span>
              </button>
            )}
          </div>
          <div className={styles.heroMark} aria-hidden="true">
            <Image src="/brand/isologo.svg" alt="" width={92} height={92} priority />
            <div><b>01 · EXPLORA</b><b>02 · AGREGA</b><b>03 · ENVÍA TU PEDIDO</b></div>
          </div>
        </header>

        <section className={styles.catalog} aria-labelledby="catalog-title">
          <div className={styles.tools}>
            <label className={styles.search}>
              <Search size={19} aria-hidden="true" />
              <span className="sr-only">Buscar productos</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto, marca o código..."
              />
            </label>
            <label>
              <span>Categoría</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">Todas las categorías</option>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className={styles.resultsBar}>
            <div>
              <span>SELECCIÓN TECPOINT</span>
              <strong id="catalog-title">{total} productos para tu negocio</strong>
            </div>
            {(search || brand || category) && (
              <button type="button" onClick={clearFilters}>Limpiar filtros</button>
            )}
          </div>

          <div className={styles.catalogLayout}>
            <aside className={styles.brandRail} aria-label="Filtrar por marca">
              <div className={styles.brandRailHeading}>
                <span>MARCAS MAYOREO</span>
                <strong>Elija una marca</strong>
              </div>
              <div className={styles.brandList}>
                <button
                  type="button"
                  className={!brand ? styles.brandActive : ""}
                  aria-pressed={!brand}
                  onClick={() => setBrand("")}
                >
                  <Image src="/brand/isologo.svg" alt="Todas las marcas" width={52} height={52} />
                  <span>Todas</span>
                </button>
                {orderedBrands.map((item) => {
                  const logo = brandLogo(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      className={brand === item ? styles.brandActive : ""}
                      aria-pressed={brand === item}
                      onClick={() => setBrand(item)}
                      title={`Ver productos ${item}`}
                    >
                      {logo ? (
                        <Image
                          src={logo}
                          alt={item}
                          width={132}
                          height={48}
                          style={{ width: "auto", height: "34px" }}
                        />
                      ) : (
                        <b aria-hidden="true">{item.slice(0, 2).toUpperCase()}</b>
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className={styles.productArea}>
          {products.length ? (
            <>
              <div className={styles.grid}>
                {products.map((product, index) => {
                  const quantity = selectedQuantity(product);
                  return (
                    <article className={styles.card} key={product.sku}>
                      <div className={styles.imageWrap}>
                        {product.stock <= 5 && <span>Últimas {product.stock}</span>}
                        <Image
                          src={product.image}
                          alt={`Imagen de ${product.name}`}
                          fill
                          sizes="(max-width: 560px) 50vw, (max-width: 900px) 33vw, 20vw"
                          quality={75}
                          priority={index < 6}
                          onError={productImageFallback}
                        />
                      </div>
                      <div className={styles.cardBody}>
                        <small>{product.brand}</small>
                        <h2>{product.name}</h2>
                        <p>Código: {product.sku}</p>
                        <span className={styles.priceLabel}>PRECIO MAYORISTA</span>
                        <strong>{product.price ? money(product.price) : "Consultar precio"}</strong>
                        <em>{product.stock > 0 ? "Disponible para pedir" : "Agotado"}</em>
                        <div className={styles.addRow}>
                          <div className={styles.stepper} aria-label={`Cantidad para ${product.name}`}>
                            <button type="button" aria-label="Restar uno" disabled={quantity <= 1} onClick={() => setProductQuantity(product, quantity - 1)}><Minus size={15} /></button>
                            <input
                              aria-label="Cantidad"
                              inputMode="numeric"
                              type="number"
                              min="1"
                              max={product.stock}
                              value={quantity}
                              onChange={(event) => setProductQuantity(product, Number(event.target.value))}
                            />
                            <button type="button" aria-label="Sumar uno" disabled={quantity >= product.stock} onClick={() => setProductQuantity(product, quantity + 1)}><Plus size={15} /></button>
                          </div>
                          <button className={styles.addButton} type="button" aria-label={`Agregar ${product.name} al pedido`} onClick={() => addProduct(product)}>Agregar al carrito <Plus size={16} aria-hidden="true" /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {products.length < total && (
                <button className={styles.loadMore} type="button" disabled={loading} onClick={loadMore}>
                  {loading ? "Cargando…" : "Cargar más productos"}
                </button>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <Image src="/brand/isologo.svg" alt="" width={68} height={68} />
              <h2>No encontramos productos con esos filtros.</h2>
              <button type="button" onClick={clearFilters}>Limpiar filtros</button>
            </div>
          )}
            </div>
          </div>
        </section>
      </main>

      {notice && <div className={styles.notice} role="status">{notice}</div>}

      <button className={styles.cartButton} type="button" onClick={() => setDrawerOpen(true)}>
        <ShoppingBag size={20} /> Carrito mayorista ({cartQuantity})
      </button>
      {drawerOpen && <button className={styles.backdrop} aria-label="Cerrar pedido" onClick={() => setDrawerOpen(false)} />}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`} aria-hidden={!drawerOpen} aria-label="Pedido de mayoreo">
        <header>
          <div><span>PEDIDO MAYOREO</span><strong>{cartQuantity} unidades</strong></div>
          <button type="button" aria-label="Cerrar" onClick={() => setDrawerOpen(false)}><X /></button>
        </header>
        <div className={styles.cartLines}>
          {cartLines.length ? cartLines.map((line) => (
            <article key={line.sku}>
              <Image src={line.image} alt="" width={64} height={64} onError={productImageFallback} />
              <div>
                <strong>{line.name}</strong>
                <small>{line.sku} · {line.price ? `${money(line.price)} c/u` : "Consultar precio"}</small>
                <div className={styles.cartQuantity}>
                  <button type="button" aria-label="Restar uno" disabled={line.quantity <= 1} onClick={() => updateCartQuantity(line.sku, line.quantity - 1)}><Minus size={14} /></button>
                  <input type="number" min="1" max={line.stock} value={line.quantity} onChange={(event) => updateCartQuantity(line.sku, Number(event.target.value))} aria-label={`Cantidad de ${line.name}`} />
                  <button type="button" aria-label="Sumar uno" disabled={line.quantity >= line.stock} onClick={() => updateCartQuantity(line.sku, line.quantity + 1)}><Plus size={14} /></button>
                  <button type="button" aria-label={`Eliminar ${line.name}`} onClick={() => updateCartQuantity(line.sku, 0)}><Trash2 size={15} /></button>
                </div>
              </div>
              <b>{line.price ? money(line.price * line.quantity) : "Por confirmar"}</b>
            </article>
          )) : (
            <div className={styles.emptyCart}>
              <ShoppingBag size={38} />
              <p>Aún no ha agregado productos a su pedido.</p>
            </div>
          )}
        </div>
        <footer>
          <div><span>TOTAL ESTIMADO</span><strong>{money(cartTotal)}</strong></div>
          <a
            className={!cartLines.length ? styles.disabled : ""}
            href={whatsappOrder()}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!cartLines.length}
            onClick={(event) => { if (!cartLines.length) event.preventDefault(); }}
          >
            Enviar pedido por WhatsApp
          </a>
          {cartLines.length > 0 && <button type="button" onClick={() => setCart({})}>Vaciar pedido</button>}
        </footer>
      </aside>
    </>
  );
}
