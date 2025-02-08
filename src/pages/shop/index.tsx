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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";

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
  const { page } = router.query;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const productsPerPage = 9;

  useEffect(() => {
    if (page) {
      setCurrentPage(Number(page));
    }
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
    router.push(`/shop?page=1`);
  };

  const filteredProducts = products.filter((product) =>
    product.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toUpperCase().includes(searchTerm.toUpperCase()) ||
    product.marca_producto.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfFirstProduct + productsPerPage);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    router.push(`/shop?page=${page}`);
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-bold">No se encontraron productos.</p>
      </div>
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

      <main className="w-full mx-auto p-2 md:p-4 mt-12">
        <h1 className="text-2xl font-bold mb-6 text-center">Bienvenido a la tienda Tecpoint</h1>

        <form onSubmit={(e) => e.preventDefault()} className="w-full md:max-w-[1200px] md:m-auto md:py-8 md:px-12 mb-2 flex flex-col gap-4 md:flex-row items-center">
          <input
            className="border w-full py-3 px-6 rounded-full"
            type="text"
            placeholder="Buscar por SKU, Producto o Descripción"
            value={searchTerm}
            onChange={handleSearchChange}
          />

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>

        {/* Paginación */}
        <div className="flex gap-3 mb-8">
          <Pagination className="flex gap-4">
            <PaginationPrevious
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className="cursor-pointer select-none"
            >
              Anterior
            </PaginationPrevious>
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer select-none"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className="cursor-pointer select-none"
            >
              Siguiente
            </PaginationNext>
          </Pagination>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:w-[1100px] mx-auto">
          {currentProducts.map((product: Product) => {
            const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

            return (
              <div
                key={product.id}
                className="border rounded-[26px] p-4 flex flex-col w-[190px] sm:w-[300px] md:w-[340px] md:h-[450px] relative justify-between"
              >
                <div className="flex flex-col">
                  <Link href={`/shop/${product.slug}`} className="hover:scale-105 transition-transform" rel="noopener noreferrer" download={false}>
                    <Image
                      src={imagen_01}
                      alt={product.producto ? `Imagen de ${product.producto}` : "Imagen del producto"}
                      width={240}
                      height={240}
                      className="m-auto sm:size-[240px] size-[180px] aspect-square object-cover mb-4"
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

      </main>

      <Footer />
    </>
  );
};

export default Shop;