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
      };
    }) as Product[];

    return {
      props: {
        products,
        totalProducts,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    return {
      props: {
        products: [],
        totalProducts: 0,
      },
    };
  }
}

const Shop = ({ products = [] }: ShopProps) => {
  const router = useRouter();
  const { page, brand, search } = router.query;
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(Array.isArray(brand) ? brand[0] : brand || "");
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const productsPerPage = 9;

  useEffect(() => {
    if (page) {
      setCurrentPage(Number(page));
    }
    if (brand) {
      setSelectedBrand(brand as string);
    }
    if (search) {
      setSearchTerm(search as string);
    }
  }, [page, brand, search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };


  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    setCurrentPage(1); // Reset to first page on brand change
    router.push(`/shop?page=1&brand=${value}&search=${searchTerm}`);
  };

  // const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   router.push(`/shop?page=1&brand=${selectedBrand}&search=${searchTerm}`);
  // };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/shop?page=1&brand=${selectedBrand}&category=${router.query.category || "all"}&search=${searchTerm}`);
  };


  const filteredProducts = products.filter((product) =>
    (selectedBrand ? product.marca_producto.marca.toLowerCase() === (typeof selectedBrand === "string" ? selectedBrand.toLowerCase() : "") : true) &&
    (router.query.category && router.query.category !== "all"
      ? (product.categorias ?? []).some((cat) => cat.toLowerCase() === (Array.isArray(router.query.category) ? router.query.category[0]?.toLowerCase() : (router.query.category ?? "all").toLowerCase()))
      : true) &&
    (product.producto.toLowerCase().includes((Array.isArray(searchTerm) ? searchTerm[0] : searchTerm).toLowerCase()) ||
      product.sku.toLowerCase().includes((Array.isArray(searchTerm) ? searchTerm[0] : searchTerm).toLowerCase()) ||
      product.descripcion.toUpperCase().includes((Array.isArray(searchTerm) ? searchTerm[0] : searchTerm).toUpperCase()))
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfFirstProduct + productsPerPage);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const category = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category || "all";
    router.push(`/shop?page=${page}&brand=${selectedBrand}&category=${category}&search=${searchTerm}`);
  };

  if (!products || products.length === 0) {
    return (
      <>
        <NavbarMenu />
        <main className="grid place-content-center fixed inset-0 -z-10">
          <p className="text-xl font-bold text-center">Ups... no se encontraron productos.</p>
        </main>
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

      <section className="bg-gray-900 h-[200px] relative">
        <video
          className="absolute w-full h-full object-cover object-center"
          width="100%"
          height="100%"
          autoPlay
          muted
          loop
          preload="none"
        >
          <source src="/video/langsdom_video.mp4" type="video/mp4" />
          <track
            src="/path/to/captions.vtt"
            kind="subtitles"
            srcLang="en"
            label="English"
          />
          Your browser does not support the video tag.
        </video>

        <div className="relative size-full flex items-center justify-center flex-col backdrop-blur-[2px] bg-[#0000005e]">
          <div className="flex flex-col gap-8 items-center pb-6">
            <i className="text-[#CCFD03] text-[20px] font-[900] text-center md:text-start leading-10 tracking-[-0.3px]">
              Nueva
              <span className="not-italic text-white block text-[30px] md:text-[50px]">
                Marca
                <Image
                  src="/logos/lagnsdom.svg"
                  alt="Langsdom Logo"
                  width={220}
                  height={80}
                  className="inline-block ml-2"
                />
              </span>
            </i>
          </div>
        </div>
      </section>

      <main className="w-full mx-auto p-2 md:p-4">

        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-[1200px] md:m-auto md:py-8 md:px-12 mb-2 flex flex-col gap-4 md:flex-row items-center">
          <input
            className="border w-full py-3 px-6 rounded-full"
            type="text"
            placeholder="Buscar por SKU, Producto o Descripción"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <div className="flex gap-4">
            <Select onValueChange={handleBrandChange} value={selectedBrand}>
              <SelectTrigger className="w-[190px] h-[50px] rounded-full px-6">
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
                router.push(`/shop?page=1&brand=${selectedBrand}&category=${value}&search=${searchTerm}`);
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
                  <SelectItem value="Audifonos">Audífonos</SelectItem>
                  <SelectItem value="Auriculares">Auriculares</SelectItem>
                  <SelectItem value="Audio">Audio</SelectItem>
                  <SelectItem value="Accesorios">Accesorios</SelectItem>
                  <SelectItem value="Cobertores">Cobertores</SelectItem>
                  <SelectItem value="cable">Cables</SelectItem>
                  <SelectItem value="Cargadores">Cargadores</SelectItem>
                  <SelectItem value="Memorias">Memorias</SelectItem>
                  <SelectItem value="power bank">Power Banks</SelectItem>
                  <SelectItem value="hub">HUB</SelectItem>
                  <SelectItem value="reloj">SmartWatch</SelectItem>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:w-[1100px] mx-auto">
          {currentProducts.map((product: Product) => {
            const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

            return (
              <div
                key={product.id}
                className="border p-4 flex flex-col sm:w-full md:w-full md:h-[450px] relative justify-between"
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

                    <div className="flex flex-wrap mt-4 gap-2 overflow-hidden w-full h-[26px]">
                      {(product.categorias || []).map((cat: string, index: number) => (
                        <span key={index} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded w-fit h-fit">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="mt-4 w-full bg-black text-white py-2 px-4 rounded-full hover:bg-black/80">
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