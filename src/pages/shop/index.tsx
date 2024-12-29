import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { db } from "@/database/Config";
import { Product } from "@/types/ProductTypes";
import { collection, getDocs } from "firebase/firestore";
import NavbarMenu from "@/components/navbarmenu/page";
import Footer from "@/components/Footer/page";

interface ShopProps {
  products: Product[];
}

export async function getStaticProps() {
  try {
    const querySnapshot = await getDocs(
      collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string)
    );
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
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    return {
      props: {
        products: [],
      },
    };
  }
}

const Shop = ({ products = [] }: ShopProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter((product) =>
    product.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toUpperCase().includes(searchTerm.toUpperCase()) ||
    product.marca_producto.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-bold">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div>
      <NavbarMenu />

      <Head>
        <title>Tienda Tecpoint | Todo en accesorios Tecnológicos</title>
        <meta
          name="description"
          content="Descubre nuestra tienda online con lo último en accesorios tecnológicos de la mejor calidad."
        />
        <meta
          property="og:title"
          content="Tienda Tecpoint | Todo en accesorios Tecnológicos"
        />
        <meta
          property="og:description"
          content="Descubre nuestra tienda online con lo último en accesorios tecnológicos de la mejor calidad."
        />
        <meta property="og:url" content="https://tecpoint.ws/shop" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
      </Head>

      <main className="w-full mx-auto p-2 md:p-4 mt-12">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Bienvenido a la tienda Tecpoint
        </h1>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full md:py-8 md:px-12 mb-2"
        >
          <input
            className="border w-full py-3 px-6 rounded-full"
            type="text"
            placeholder="Buscar por SKU, Producto o Descripción"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>


        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:w-[1100px] mx-auto">
          {filteredProducts.map((product: Product) => {
            const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

            return (
              <div
                key={product.id}
                className="border rounded-[26px] p-4 flex flex-col w-[190px] sm:w-[300px] md:w-[340px] md:h-[450px] relative justify-between"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="hover:scale-105 transition-transform"
                    rel="noopener noreferrer"
                    download={false}
                  >
                    <Image
                      src={imagen_01}
                      alt={
                        product.producto
                          ? `Imagen de ${product.producto}`
                          : "Imagen del producto"
                      }
                      width={240}
                      height={240}
                      className="m-auto sm:size-[240px] size-[180px] aspect-square object-cover mb-4"
                      quality={100}
                      priority
                    />
                  </Link>

                  <div>
                    <h2 className="text-[13px] md:text-[17px] font-semibold tracking-[-0.2px] leading-[18px]">
                      {product.producto}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      SKU: {product.sku}
                    </p>

                    <div className="flex flex-wrap mt-4 gap-2 overflow-hidden w-full h-[26px]">
                      {(product.categorias || []).map((cat: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded w-fit h-fit"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="mt-4 w-full bg-black text-white py-2 px-4 rounded-full hover:bg-black/80">
                  <Link href={`/shop/${product.slug}`}>
                    Ver Producto
                  </Link>
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;