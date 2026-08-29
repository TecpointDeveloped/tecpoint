import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { productImageFallback } from "@/lib/imageFallback";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "@/database/Config";
import { Product } from "@/types/ProductTypes"; // Asumiendo que esta es la ruta correcta
import { collection, getDocs } from "firebase/firestore";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GetServerSidePropsContext } from "next";
import {
  categorySlug,
  approvedCatalogProducts,
  enrichProduct,
  getCurrentInventory,
  matchesProductSearch,
  normalizeText,
  OFFICIAL_CATEGORIES,
  productColor,
  productAddedTime,
  isNewProduct,
  publicCatalog,
} from "@/lib/catalog";
import shopStyles from "@/styles/shopHero2026.module.css";
import { trackSearch, trackViewCategory } from "@/lib/tracking";
import { Search } from "lucide-react";

interface ShopProps {
  products: Product[];
  totalProducts: number;
  brands: string[];
  colors: string[];
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=900",
  );

  try {
    const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
    const querySnapshot = await getDocs(productsRef);

    const allProducts = publicCatalog([...querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return enrichProduct({
        id: doc.id,
        ...data,
        fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
        // --- CORRECCIÓN APLICADA AQUÍ ---
        // Aseguramos que 'categorias' siempre sea un array.
        // Si data.categorias no es un array, se inicializa como un array vacío.
        categorias: Array.isArray(data.categorias) ? data.categorias : [],
      } as Product);
    }) as Product[], ...approvedCatalogProducts()])
      .filter((product) => Boolean(getCurrentInventory(product.sku)))
      .sort((left, right) => {
        const dateDifference = productAddedTime(right) - productAddedTime(left);
        if (dateDifference) return dateDifference;
        const stockDifference =
          Number(Boolean(right.extradata?.stock)) -
          Number(Boolean(left.extradata?.stock));
        if (stockDifference) return stockDifference;
        return left.producto.localeCompare(right.producto, "es");
      });

    const queryValue = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value || "";
    const page = Math.max(1, Number(queryValue(context.query.page)) || 1);
    const brand = queryValue(context.query.brand).trim().toLowerCase();
    const category = queryValue(context.query.category).trim().toLowerCase();
    const color = queryValue(context.query.color).trim().toLowerCase();
    const search = queryValue(context.query.search).trim().toLowerCase();
    const productsPerPage = 9;
    const brandLabels = new Map<string, string>();
    allProducts.forEach((product) => {
      const label = product.marca_producto?.marca?.trim();
      if (!label) return;
      const key = normalizeText(label);
      const current = brandLabels.get(key);
      const isAllCaps = (value: string) =>
        value === value.toLocaleUpperCase("es") &&
        value !== value.toLocaleLowerCase("es");
      if (!current || (isAllCaps(current) && !isAllCaps(label))) {
        brandLabels.set(key, label);
      }
    });
    const brands = [...brandLabels.values()]
      .sort((a, b) => a.localeCompare(b, "es"));
    const colors = [...new Set(allProducts.map((product) => productColor(product)).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    const filteredProducts = allProducts.filter((product) => {
      const matchesBrand = brand
        ? normalizeText(product.marca_producto?.marca || "") === normalizeText(brand)
        : true;
      const matchesCategory = category && category !== "all"
        ? (product.categorias || []).some((item) => categorySlug(item) === category)
        : true;
      const matchesColor = color
        ? normalizeText(productColor(product)) === normalizeText(color)
        : true;
      const matchesSearch = matchesProductSearch(product, search);

      return matchesBrand && matchesCategory && matchesColor && matchesSearch;
    });
    const totalProducts = filteredProducts.length;
    const products = filteredProducts.slice(
      (page - 1) * productsPerPage,
      page * productsPerPage,
    );

    return {
      props: {
        products,
        totalProducts,
        brands,
        colors,
      },
    };
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    return {
      props: {
        products: [],
        totalProducts: 0,
        brands: [],
        colors: [],
      },
    };
  }
}

const Shop = ({ products = [], totalProducts = 0, brands = [], colors = [] }: ShopProps) => {
  const router = useRouter();
  const { page, brand, search } = router.query;
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    Array.isArray(brand) ? brand[0] : (brand || undefined) as string | undefined
  );
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const productsPerPage = 9;
  const hasActiveFilters = Boolean(
    router.query.search ||
      router.query.brand ||
      router.query.color ||
      (router.query.category && router.query.category !== "all") ||
      (router.query.page && router.query.page !== "1"),
  );

  useEffect(() => {
    if (page) {
      setCurrentPage(Number(page));
    }
    if (brand) {
      setSelectedBrand(Array.isArray(brand) ? brand[0] : brand);
    }
    if (search) {
      setSearchTerm(Array.isArray(search) ? search[0] : search);
    }
  }, [page, brand, search]);

  useEffect(() => {
    if (!router.isReady) return;
    const selectedCategory = Array.isArray(router.query.category)
      ? router.query.category[0]
      : router.query.category;
    trackViewCategory(selectedCategory && selectedCategory !== "all" ? selectedCategory : "Catálogo TECPOINT");
  }, [router.isReady, router.query.category]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const navigateToShop = (query: Record<string, string | number>) =>
    router.push({ pathname: "/shop", query });

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setCurrentPage(1); // Reset to first page on brand change
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    navigateToShop({ page: 1, brand: value, category: currentCategory, color: currentColor, search: currentSearch });
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    trackSearch(currentSearch || "");
    const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    navigateToShop({ page: 1, brand: currentBrand, category: currentCategory, color: currentColor, search: currentSearch });
  };

  const currentProducts = products;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const category = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    navigateToShop({ page, brand: currentBrand, category, color: currentColor, search: currentSearch });
  };

  const pageHref = (pageNumber: number) => {
    const category = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    return `/shop?page=${pageNumber}&brand=${encodeURIComponent(currentBrand)}&category=${encodeURIComponent(category)}&color=${encodeURIComponent(currentColor)}&search=${encodeURIComponent(currentSearch)}`;
  };

  if (!products || products.length === 0) {
    return (
      <>
        <NavbarMenu />
        <main className="grid place-content-center fixed inset-0 -z-10">
          <p className="text-xl font-bold text-center">Ups... no se encontraron productos.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Tienda TECPOINT | Accesorios tecnológicos en Honduras</title>
        <meta name="description" content="Encuentre cargadores, audífonos, protectores, cases, power banks y accesorios tecnológicos en Honduras. Busque por necesidad, marca, color o compatibilidad." />
        <meta property="og:title" content="Tienda TECPOINT | Accesorios tecnológicos en Honduras" />
        <meta property="og:description" content="Productos tecnológicos actuales, filtros claros y asesoría para confirmar compatibilidad." />
        <meta property="og:url" content="https://tecpoint.ws/shop" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <link rel="canonical" href="https://tecpoint.ws/shop" />
        <link rel="alternate" hrefLang="es-HN" href="https://tecpoint.ws/shop" />
        <link rel="alternate" hrefLang="x-default" href="https://tecpoint.ws/shop" />
        <meta
          name="robots"
          content={hasActiveFilters ? "noindex,follow" : "index,follow"}
        />
      </Head>

      <NavbarMenu />

      <section className={shopStyles.hero}>
        <div className={shopStyles.copy}>
          <p className={shopStyles.eyebrow}>CATÁLOGO ACTUAL TECPOINT</p>
          <h1>
            Encuentre su tecnología
            <span>por necesidad.</span>
          </h1>
          <p className={shopStyles.summary}>
            Explore productos actuales, filtre por categoría, marca o color y
            confirme compatibilidad con un asesor.
          </p>
          <div className={shopStyles.guide} aria-label="Formas de explorar el catálogo">
            <span>01 · BUSQUE</span>
            <span>02 · COMPARE</span>
            <span>03 · ELIJA</span>
          </div>
        </div>

        <div className={shopStyles.visual} aria-hidden="true">
          <div className={shopStyles.grid} />
          <div className={shopStyles.orbit}>
            <div className={shopStyles.mark}>
              <Image src="/brand/isologo.svg" alt="" width={210} height={210} priority />
            </div>
          </div>
          <p className={shopStyles.signalCopy}>TECNOLOGÍA QUE SE SIENTE</p>
          <div className={shopStyles.rail}>
            <span>CARGA</span>
            <span>PROTEGE</span>
            <span>CONECTA</span>
          </div>
        </div>
      </section>

      <main className="w-full mx-auto p-2 md:p-4 bg-[#f5f7f8]">

        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-[1200px] md:m-auto md:py-8 md:px-12 mb-2 flex flex-col gap-4 md:flex-row items-center bg-white">
          <input
            className="border w-full py-3 px-6 rounded-full"
            type="text"
            placeholder="Buscar por producto, compatibilidad, marca o SKU"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            type="submit"
            className="flex h-[50px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#c8102e] px-6 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[#a90d26] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 md:w-auto"
          >
            <Search size={17} aria-hidden="true" /> Buscar
          </button>

          <div className="flex flex-wrap gap-3">
            <Select onValueChange={handleBrandChange} value={selectedBrand}>
              <SelectTrigger className="w-[190px] h-[50px] rounded-full px-6">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Marcas</SelectLabel>
                  {brands.map((brandName) => (
                    <SelectItem key={brandName} value={brandName}>{brandName}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
                const currentBrand = selectedBrand || "";
                const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
                navigateToShop({ page: 1, brand: currentBrand, category: value, color: currentColor, search: currentSearch });
              }}
              value={Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || ""}
            >
              <SelectTrigger className="w-[190px] h-[50px] rounded-full px-6">
                <SelectValue placeholder="Categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categorías</SelectLabel>
                  <SelectItem value="all">Todas</SelectItem>
                  {OFFICIAL_CATEGORIES.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>{category.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
                const currentBrand = selectedBrand || "";
                const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
                navigateToShop({ page: 1, brand: currentBrand, category: currentCategory, color: value, search: currentSearch });
              }}
              value={Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || ""}
            >
              <SelectTrigger className="w-[170px] h-[50px] rounded-full px-6">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Colores</SelectLabel>
                  {colors.map((colorName) => (
                    <SelectItem key={colorName} value={normalizeText(colorName)}>{colorName}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </form>

        <section className="w-[calc(100%-2rem)] md:max-w-[1200px] mx-auto mb-7 rounded-2xl border border-[#dfe3e4] bg-white px-5 py-5 md:px-7 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between text-[#111516] shadow-[0_10px_35px_rgba(17,21,22,.04)]">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#f8e9ec] text-sm font-black text-[#c8102e]">{totalProducts}</div>
            <div className="min-w-0">
              <span className="block text-[9px] font-extrabold uppercase tracking-[.18em] text-[#c8102e]">Resultados</span>
              <p className="mt-1 text-sm leading-5 text-[#5e686a]">
                <strong className="font-bold text-[#111516]">{totalProducts === 1 ? "1 producto disponible" : `${totalProducts} productos disponibles`}</strong>
                {searchTerm ? " · Opciones cercanas a su búsqueda." : " · Encuentre la opción adecuada para usted."}
              </p>
            </div>
          </div>
          <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
            {selectedBrand && <span className="inline-flex min-h-10 items-center rounded-full bg-[#111516] px-5 text-[10px] font-bold uppercase tracking-[.08em] text-white">Marca: {selectedBrand}</span>}
            {!hasActiveFilters && (
              <Link
                href="/shop?page=1&brand=Rock%20Space&category=all&color=&search="
                className="inline-flex min-h-10 items-center rounded-full bg-[#111516] px-5 text-[10px] font-bold uppercase tracking-[.08em] text-white transition-colors hover:bg-[#c8102e]"
              >
                Explorar Rock Space
              </Link>
            )}
            {hasActiveFilters && (
              <Link
                href="/shop"
                className="inline-flex min-h-10 items-center rounded-full border border-[#cfd5d7] bg-white px-5 text-[10px] font-bold uppercase tracking-[.08em] text-[#111516] transition-colors hover:border-[#c8102e] hover:text-[#c8102e]"
              >
                Limpiar filtros
              </Link>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:w-[1100px] mx-auto gap-3">
          {currentProducts.map((product: Product, productIndex: number) => {
            const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

            return (
              <article
                key={product.id}
                className="border border-[#dfe3e4] bg-white p-4 flex flex-col min-w-0 sm:w-full md:w-full min-h-[430px] relative justify-between overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute top-4 left-4 z-10">
                  {isNewProduct(product) && (
                    <div className="mb-2 w-fit rounded-full bg-[#c8102e] px-4 py-1 text-white shadow-lg">
                      <p className="text-[12px] font-extrabold uppercase tracking-[.08em]">Nuevo</p>
                    </div>
                  )}
                  {product.extradata?.stock !== true && (
                    <div className="bg-[#fcb9b9] w-fit px-4 py-1 rounded-full">
                      <p className="text-[#b51d1d] font-bold text-[14px]">Agotado</p>
                    </div>
                  )}
                </span>

                <div className="flex flex-col">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="hover:scale-105 transition-transform"
                    aria-label={`Ver ${product.producto}`}
                  >
                    <Image
                      src={imagen_01}
                      alt={product.producto ? `Imagen de ${product.producto}` : "Imagen del producto"}
                      width={240}
                      height={240}
                      className="m-auto sm:size-[240px] size-[180px] aspect-square object-contain mb-4"
                      quality={75}
                      priority={productIndex < 3}
                      sizes="(max-width: 640px) 180px, 240px"
                      onError={productImageFallback}
                    />
                  </Link>

                  <div>
                    <h2 className="text-[13px] md:text-[17px] font-semibold tracking-[-0.2px] leading-[1.35] break-words [overflow-wrap:anywhere]">{product.producto}</h2>
                    <p className="text-sm text-gray-500 mt-2">SKU: {product.sku}</p>
                    {productColor(product) && (
                      <p className="text-xs text-[#cf2c28] mt-1 font-semibold">
                        Color: {productColor(product)}
                      </p>
                    )}

                    <div className="flex flex-wrap mt-4 gap-2 overflow-hidden w-full h-[26px]">
                      {/* Aquí product.categorias ya es garantizado como un array por getStaticProps */}
                      {(product.categorias || []).map((cat: string, index: number) => (
                        <span key={index} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded w-fit h-fit">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/shop/${product.slug}`}
                  className="mt-4 min-h-11 w-full inline-flex items-center justify-center bg-[#c8102e] text-white py-2 px-4 rounded-full hover:bg-[#981027] focus-visible:bg-[#981027]"
                >
                  Ver producto
                </Link>
              </article>
            );
          })}
        </div>

        {currentProducts.length === 0 ? (
          <section className="w-full h-[50vh] flex flex-col gap-6 items-center justify-center pb-20">
            <h1 className="text-gray-600 text-center">Ups... Actualmente no hay Productos con los filtros seleccionados</h1>

            <div className="flex flex-col items-center mt-4 gap-2">
              <span className="text-sm text-gray-600">
                <strong>Filtros seleccionados:</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedBrand && (
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Marca: {selectedBrand}
                  </span>
                )}
                {(router.query.category && router.query.category !== "all") && (
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Categoría: {Array.isArray(router.query.category) ? router.query.category[0] : router.query.category}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Búsqueda: {searchTerm}
                  </span>
                )}
                {!selectedBrand && (!router.query.category || router.query.category === "all") && !searchTerm && (
                  <span className="text-xs text-gray-400">Ningún filtro seleccionado</span>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="z-10 bottom-0 left-0 w-full flex items-center justify-center mt-12">
            <div className="flex justify-center mb-8 bg-white w-full md:w-[60%]">
              <Pagination className="flex flex-wrap gap-2 md:gap-4">
                <PaginationPrevious
                  href={pageHref(Math.max(1, currentPage - 1))}
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  aria-disabled={currentPage === 1}
                  className={`cursor-pointer select-none rounded-full ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Anterior
                </PaginationPrevious>
                <PaginationContent className="flex flex-wrap gap-2 md:gap-4">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
                    const startPage = Math.max(1, Math.min(currentPage - 5, totalPages - 9));
                    const page = startPage + index;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href={pageHref(page)}
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className={currentPage ? page === currentPage ? 'bg-black text-white rounded-full' : 'bg-white text-black  rounded-full' : 'bg-white text-black  rounded-full'}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                </PaginationContent>
                <PaginationNext
                  href={pageHref(Math.min(totalPages, currentPage + 1))}
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  aria-disabled={currentPage === totalPages}
                  className={`cursor-pointer select-none rounded-full ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Siguiente
                </PaginationNext>
              </Pagination>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Shop;
