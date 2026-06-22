import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "@/database/Config";
import { Product } from "@/types/ProductTypes";
import { collection, getDocs } from "firebase/firestore";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShopProps {
  products: Product[];
  totalProducts: number;
}

export async function getStaticProps() {
  try {
    const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
    const querySnapshot = await getDocs(productsRef);

    const totalProducts = querySnapshot.size;
    const products = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
        categorias: Array.isArray(data.categorias) ? data.categorias : [],
      };
    }) as Product[];

    return {
      props: { products, totalProducts },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    return {
      props: { products: [], totalProducts: 0 },
    };
  }
}

const Shop = ({ products = [] }: ShopProps) => {
  const router = useRouter();
  const { page, brand, search } = router.query;
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    Array.isArray(brand) ? brand[0] : (brand || undefined) as string | undefined
  );
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const productsPerPage = 12;

  useEffect(() => {
    if (page) setCurrentPage(Number(page));
    if (brand) setSelectedBrand(Array.isArray(brand) ? brand[0] : brand);
    if (search) setSearchTerm(Array.isArray(search) ? search[0] : search);
  }, [page, brand, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setCurrentPage(1);
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    router.push(`/shop?page=1&brand=${value}&category=${currentCategory}&search=${currentSearch}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    router.push(`/shop?page=1&brand=${currentBrand}&category=${currentCategory}&search=${currentSearch}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesBrand = selectedBrand
      ? (product.marca_producto?.marca || "").toLowerCase() === selectedBrand.toLowerCase()
      : true;

    const categoryQuery = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category;
    const matchesCategory = (categoryQuery && categoryQuery !== "all")
      ? (product.categorias || []).some((cat) => cat.toLowerCase() === categoryQuery.toLowerCase())
      : true;

    const currentSearchTerm = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const matchesSearch = currentSearchTerm
      ? (product.producto || "").toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        (product.sku || "").toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
        (product.descripcion || "").toLowerCase().includes(currentSearchTerm.toLowerCase())
      : true;

    return matchesBrand && matchesCategory && matchesSearch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfFirstProduct + productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const category = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    router.push(`/shop?page=${page}&brand=${currentBrand}&category=${category}&search=${currentSearch}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category;
  const hasActiveFilters = selectedBrand || (activeCategory && activeCategory !== "all") || searchTerm;

  const clearFilters = () => {
    setSelectedBrand(undefined);
    setSearchTerm("");
    router.push("/shop?page=1&brand=&search=");
  };

  if (!products || products.length === 0) {
    return (
      <>
        <NavbarMenu />
        <main className="grid place-content-center h-[70vh]">
          <p className="text-xl font-bold text-center text-gray-500">Ups... no se encontraron productos.</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Tienda Online | Accesorios Tecnológicos | Tecpoint Honduras</title>
        <meta name="description" content="Tienda Tecpoint: Cargadores, audífonos, cables, cobertores y más accesorios tech. Envío gratis mayores a Lps. 1,500. Pago al recibir. ¡Compra ahora!" />
        <meta name="keywords" content="tienda accesorios tecnológicos Honduras, comprar cargadores, audífonos, cables, cobertores iPhone, power banks, smartwatch" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="es-HN" />
        <meta name="author" content="Tecpoint Distribucion" />
        <link rel="canonical" href="https://tecpoint.ws/shop" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Tienda Tecpoint | Accesorios Tecnológicos al Mejor Precio" />
        <meta property="og:description" content="Descubre nuestro catálogo completo. Apple, Hoco, Krieg y más marcas. Envío a Honduras, pago al recibir." />
        <meta property="og:url" content="https://tecpoint.ws/shop" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@tecpointhn" />
        <meta name="twitter:title" content="Tienda Tecpoint - Accesorios Tech Honduras" />
        <meta name="twitter:description" content="Compra accesorios tech premium con envío gratis. Pago al recibir. Miles de productos." />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
      </Head>

      <NavbarMenu />

      {/* Hero */}
      <section className="bg-black relative h-[180px] md:h-[220px] flex items-center justify-center overflow-hidden">
        <video
          className="absolute w-full h-full object-cover opacity-30"
          autoPlay muted loop preload="none"
        >
          <source src="/video/langsdom_video.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 text-center px-4">
          <p className="text-[#CCFD03] text-xs font-bold uppercase tracking-widest mb-2">Tecpoint</p>
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight">Tienda</h1>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 py-8">

        {/* Barra de búsqueda y filtros */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 mb-8">
          {/* Buscador */}
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              className="w-full h-11 bg-gray-50 border border-gray-200 pl-10 pr-4 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
              type="text"
              placeholder="Buscar por SKU, producto o descripción..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex gap-2">
            <Select onValueChange={handleBrandChange} value={selectedBrand}>
              <SelectTrigger className="h-11 rounded-full px-5 bg-gray-50 border-gray-200 text-sm min-w-[150px]">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Marcas</SelectLabel>
                  <SelectItem value="Apple">Apple</SelectItem>
                  <SelectItem value="Appacs">Appacs</SelectItem>
                  <SelectItem value="Deken">Deken</SelectItem>
                  <SelectItem value="Ghostek">Ghostek</SelectItem>
                  <SelectItem value="Hypergear">Hypergear</SelectItem>
                  <SelectItem value="Hoco">Hoco</SelectItem>
                  <SelectItem value="Krieg">Krieg</SelectItem>
                  <SelectItem value="Langsdom">Langsdom</SelectItem>
                  <SelectItem value="Naztech">Naztech</SelectItem>
                  <SelectItem value="Powerpeak">Powerpeak</SelectItem>
                  <SelectItem value="Rockspace">Rockspace</SelectItem>
                  <SelectItem value="Samsung">Samsung</SelectItem>
                  <SelectItem value="USG">USG</SelectItem>
                  <SelectItem value="XBase">XBase</SelectItem>
                  <SelectItem value="XO">XO</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              onValueChange={(value) => {
                const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
                const currentBrand = selectedBrand || "";
                router.push(`/shop?page=1&brand=${currentBrand}&category=${value}&search=${currentSearch}`);
              }}
              value={Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || ""}
            >
              <SelectTrigger className="h-11 rounded-full px-5 bg-gray-50 border-gray-200 text-sm min-w-[150px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categorías</SelectLabel>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="vidrio">Protección de Pantalla Premium</SelectItem>
                  <SelectItem value="cobertor">Fundas & Cobertores Premium</SelectItem>
                  <SelectItem value="carga">Carga Inteligente</SelectItem>
                  <SelectItem value="cable">Cables Premium</SelectItem>
                  <SelectItem value="audio">Audio & Sonido</SelectItem>
                  <SelectItem value="smartwatch">Smartwatch & Wearables</SelectItem>
                  <SelectItem value="carro">Accesorios para Auto</SelectItem>
                  <SelectItem value="soporte">Soportes & Creación de Contenido</SelectItem>
                  <SelectItem value="oficina">Productividad & Oficina</SelectItem>
                  <SelectItem value="Lifestyle & Organización Tech">Lifestyle & Organización Tech</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <button
              type="submit"
              className="h-11 px-5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Filtros activos + contador */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
              {hasActiveFilters && (
              <>
                <span className="text-gray-300">|</span>
                {selectedBrand && (
                  <span className="flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Marca: {selectedBrand}
                  </span>
                )}
                {activeCategory && activeCategory !== "all" && (
                  <span className="flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {activeCategory}
                  </span>
                )}
                {searchTerm && (
                  <span className="flex items-center gap-1.5 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
                    &quot;{searchTerm}&quot;
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-black underline transition-colors"
                >
                  Limpiar filtros
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Página {currentPage} de {totalPages}
          </p>
        </div>

        {/* Paginación superior */}
        {currentProducts.length > 0 && (
          <div className="flex items-center justify-center mb-8">
            <Pagination>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={`cursor-pointer select-none rounded-full border border-gray-200 hover:bg-gray-100 transition-colors ${currentPage === 1 ? 'opacity-40 pointer-events-none' : ''}`}
              />
              <PaginationContent className="flex gap-1.5">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
                  const startPage = Math.max(1, Math.min(currentPage - 5, totalPages - 9));
                  const p = startPage + index;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => handlePageChange(p)}
                        isActive={currentPage === p}
                        className={`rounded-full cursor-pointer size-9 flex items-center justify-center font-medium text-sm transition-colors ${
                          currentPage === p
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              </PaginationContent>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={`cursor-pointer select-none rounded-full border border-gray-200 hover:bg-gray-100 transition-colors ${currentPage === totalPages ? 'opacity-40 pointer-events-none' : ''}`}
              />
            </Pagination>
          </div>
        )}

        {/* Grid de productos */}
        {currentProducts.length === 0 ? (
          <section className="w-full h-[50vh] flex flex-col gap-4 items-center justify-center">
            <div className="size-16 rounded-full bg-gray-100 grid place-content-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="font-semibold text-gray-800 mb-1">Sin resultados</h2>
              <p className="text-sm text-gray-500">No encontramos productos con los filtros seleccionados.</p>
            </div>
            <button
              onClick={clearFilters}
              className="mt-2 px-6 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Ver todos los productos
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentProducts.map((product: Product) => {
              const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";
              const inStock = product.extradata?.stock === true;

              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 bg-white"
                >
                  {/* Imagen */}
                  <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-4">
                    {!inStock && (
                      <span className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
                        <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-[11px] font-semibold text-red-600">Agotado</span>
                      </span>
                    )}
                    <Image
                      src={imagen_01}
                      alt={product.producto ? `Imagen de ${product.producto}` : "Imagen del producto"}
                      width={240}
                      height={240}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      quality={90}
                      priority
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-col flex-1 justify-between p-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <h2 className="text-[13px] md:text-[14px] font-semibold leading-snug text-gray-900 line-clamp-2">
                        {product.producto}
                      </h2>
                      <p className="text-[11px] text-gray-400 font-medium">SKU: {product.sku}</p>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {(product.categorias || []).slice(0, 2).map((cat: string, index: number) => (
                          <span key={index} className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="w-full flex items-center justify-center bg-black text-white text-sm font-semibold py-2 rounded-full group-hover:bg-gray-800 transition-colors">
                      Ver producto
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {currentProducts.length > 0 && (
          <div className="flex items-center justify-center mt-12">
            <Pagination>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={`cursor-pointer select-none rounded-full border border-gray-200 hover:bg-gray-100 transition-colors ${currentPage === 1 ? 'opacity-40 pointer-events-none' : ''}`}
              />
              <PaginationContent className="flex gap-1.5">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
                  const startPage = Math.max(1, Math.min(currentPage - 5, totalPages - 9));
                  const p = startPage + index;
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        onClick={() => handlePageChange(p)}
                        isActive={currentPage === p}
                        className={`rounded-full cursor-pointer size-9 flex items-center justify-center font-medium text-sm transition-colors ${
                          currentPage === p
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              </PaginationContent>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={`cursor-pointer select-none rounded-full border border-gray-200 hover:bg-gray-100 transition-colors ${currentPage === totalPages ? 'opacity-40 pointer-events-none' : ''}`}
              />
            </Pagination>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Shop;
