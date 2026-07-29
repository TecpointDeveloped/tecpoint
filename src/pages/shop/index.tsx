import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
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
  enrichProduct,
  normalizeText,
  OFFICIAL_CATEGORIES,
  productColor,
} from "@/lib/catalog";

interface ShopProps {
  products: Product[];
  totalProducts: number;
  brands: string[];
  colors: string[];
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
    const querySnapshot = await getDocs(productsRef);

    const allProducts = querySnapshot.docs.map((doc) => {
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
    }) as Product[];

    const queryValue = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value || "";
    const page = Math.max(1, Number(queryValue(context.query.page)) || 1);
    const brand = queryValue(context.query.brand).trim().toLowerCase();
    const category = queryValue(context.query.category).trim().toLowerCase();
    const color = queryValue(context.query.color).trim().toLowerCase();
    const search = queryValue(context.query.search).trim().toLowerCase();
    const productsPerPage = 9;
    const brands = [...new Set(allProducts.map((product) => product.marca_producto?.marca).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)) as string[];
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
      const matchesSearch = search
        ? [product.producto, product.sku, product.descripcion, product.Subcategorias]
            .some((value) => normalizeText(value || "").includes(normalizeText(search)))
        : true;

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setCurrentPage(1); // Reset to first page on brand change
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    router.push(`/shop?page=1&brand=${value}&category=${currentCategory}&color=${currentColor}&search=${currentSearch}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    router.push(`/shop?page=1&brand=${currentBrand}&category=${currentCategory}&color=${currentColor}&search=${currentSearch}`);
  };

  const currentProducts = products;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const category = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    const currentBrand = selectedBrand || "";
    const currentSearch = Array.isArray(searchTerm) ? searchTerm[0] : searchTerm;
    const currentColor = Array.isArray(router.query.color) ? router.query.color[0] : router.query.color || "";
    router.push(`/shop?page=${page}&brand=${currentBrand}&category=${category}&color=${currentColor}&search=${currentSearch}`);
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
        <title>Tienda Tecpoint | Todo en accesorios Tecnológicos</title>
        <meta name="description" content="Descubre nuestra tienda online con lo último en accesorios tecnológicos de la mejor calidad." />
        <meta property="og:title" content="Tienda Tecpoint | Todo en accesorios Tecnológicos" />
        <meta property="og:description" content="Descubre nuestra tienda online con lo último en accesorios tecnológicos de la mejor calidad." />
        <meta property="og:url" content="https://tecpoint.ws/shop" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
      </Head>

      <NavbarMenu />

      <section className="min-h-[300px] px-6 py-16 md:px-[7vw] flex items-end bg-[#cf2c28] bg-[url('/brand/signal-band.svg')] bg-no-repeat bg-right bg-contain text-white">
        <div className="max-w-[920px]">
          <p className="mb-4 text-[10px] font-extrabold tracking-[.2em]">CATÁLOGO ACTUAL TECPOINT</p>
          <h1 className="m-0 text-[48px] md:text-[76px] font-semibold leading-[.92] tracking-[-.055em]">
            Encuentre su tecnología por necesidad.
          </h1>
          <p className="mt-5 max-w-[650px] text-sm md:text-base text-white/80">
            Explore productos actuales, filtre por categoría, marca o color y confirme compatibilidad con un asesor.
          </p>
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
                router.push(`/shop?page=1&brand=${currentBrand}&category=${value}&color=${currentColor}&search=${currentSearch}`);
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
                router.push(`/shop?page=1&brand=${currentBrand}&category=${currentCategory}&color=${value}&search=${currentSearch}`);
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

        {/* Paginación */}
        <section className="z-10 bottom-0 left-0 w-full flex items-center justify-center">
          <div className="flex justify-center mb-8 bg-white w-full md:w-[60%]">
            <Pagination className="flex flex-wrap gap-2 md:gap-4">
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
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
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={`cursor-pointer select-none rounded-full ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Siguiente
              </PaginationNext>
            </Pagination>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:w-[1100px] mx-auto gap-2">
          {currentProducts.map((product: Product) => {
            const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

            return (
              <div
                key={product.id}
                className="border border-[#dfe3e4] bg-white p-4 flex flex-col sm:w-full md:w-full md:h-[450px] relative justify-between"
              >
                <span className="absolute top-4 left-4 z-10">
                  {product.extradata?.stock !== true && (
                    <div className="bg-[#fcb9b9] w-fit px-4 py-1 rounded-full">
                      <p className="text-[#b51d1d] font-bold text-[14px]">Agotado</p>
                    </div>
                  )}
                </span>

                <div className="flex flex-col">
                  <Link href={`/shop/${product.slug}`} className="hover:scale-105 transition-transform" rel="noopener noreferrer" download={false}>
                    <Image
                      src={imagen_01}
                      alt={product.producto ? `Imagen de ${product.producto}` : "Imagen del producto"}
                      width={240}
                      height={240}
                      className="m-auto sm:size-[240px] size-[180px] aspect-square object-contain mb-4"
                      quality={100}
                      priority
                    />
                  </Link>

                  <div>
                    <h2 className="text-[13px] md:text-[17px] font-semibold tracking-[-0.2px] leading-[18px]">{product.producto}</h2>
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

                <button className="mt-4 w-full bg-[#cf2c28] text-white py-2 px-4 rounded-full hover:bg-[#a7192f]">
                  <Link href={`/shop/${product.slug}`}>Ver Producto</Link>
                </button>
              </div>
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
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
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
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
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
