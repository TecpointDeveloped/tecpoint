import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import NavbarMenu from "@/components/navbarmenu/page";
import LogosImages from "@/data/logos.json";
import CategoryCards from "@/components/CategoryCards/page";
import { useEffect, useState } from "react";
import { Product } from "@/types/ProductTypes";
import { Logo } from "@/types/ProductTypes";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/Config";

export async function getStaticProps() {
  const fetchProducts = async (): Promise<Product[]> => {
    const productsCollection = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME);
    const productDocs = await getDocs(productsCollection);

    return productDocs.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha_agregado: data.fecha_agregado?.toDate
          ? data.fecha_agregado.toDate().toISOString()
          : null,
      };
    }) as Product[];
  };

  const products = await fetchProducts();

  return {
    props: {
      logos: LogosImages as Logo[],
      products,
    },
    revalidate: 60,
  };
}

interface HomeProps {
  logos: Logo[];
  products: Product[];
}

export default function Home({ logos, products }: HomeProps) {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="pb-[600px]">
      <Head>
        <title>Distribuidores de Accesorios Tecnológicos | Tecpoint</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <meta name="keywords" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta name="description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:image" content="/favicon.png" />
        <meta property="og:title" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta property="og:description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta name="twitter:description" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta name="twitter:image" content="favicon.png" />
        <meta name="twitter:image:alt" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
      </Head>

      <NavbarMenu />

      <div className="w-full h-[85dvh] sm:h-[75dvh] md:h-[75vh] bg-[#010101] flex flex-col items-center justify-center overflow-hidden md:gap-y-6 2xl:gap-y-12">
        <div className="flex-1 flex-col w-full items-center justify-center flex md:items-center md:justify-end gap-y-2">
          <h3 className="text-center text-white opacity-55 2xl:text-[20px]">
            iPhone 16 series
          </h3>
          <h2 className="text-white text-4xl tracking-[-1.4px] text-center leading-[30px] 2xl:text-[50px]">
            Nuevos Cobertores Ghostek
          </h2>
        </div>

        <div className="px-4 md:px-12 flex items-center justify-center relative">
          <Image
            alt="cobertores iPhone 16 marca ghostek"
            src="/banner_cobertores_ghostek.png"
            width={340}
            height={340}
            quality={80}
            priority={true}
            sizes="(min-width: 1536px) 390px, (min-width: 768px) 390px, 340px"
            className="w-fit h-[340px] z-[1] md:h-[390px] 2xl:h-[390px] object-cover hover:scale-105 transition-transform"
          />

          <Image
            alt="cobertores iPhone 16 marca ghostek"
            src="/banner_cobertores_ghostek.png"
            width={390}
            height={390}
            priority={true}
            sizes="(min-width: 1536px) 480px, (min-width: 768px) 390px, 340px"
            className="blur-2xl grayscale select-none -mb-7 opacity-75 scale-110 absolute w-[390px] md:h-[390px] 2xl:h-[480px] object-cover"
          />
        </div>
      </div>

      <div className="relative overflow-hidden w-full md:w-full lg:max-w-[1900px] py-4 m-auto">
        <div className="bg-gradient-to-r from-white to-transparent h-full w-24 absolute top-0 left-0 z-10" />
        <div className="marquee">
          <div className="marquee-inner flex">
            {logos.map((logo, index) => (
              <div
                key={index}
                className={`hover:bg-[#f3f3f3] w-[260px] h-[70px] 2xl:h-[80px] hover:scale-105 rounded-[8px] grid place-content-center cursor-pointer transition-all mx-4`}
              >
                <Image
                  height={30}
                  width={180}
                  quality={95}
                  src={logo.logo || ""}
                  alt={`Logo ${index}`}
                  className="w-fit h-[30px] select-none aspect-auto"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-transparent to-white h-full w-24 absolute top-0 right-0 z-10" />
      </div>

      <section className="py-8 px-4 flex flex-col gap-y-6">
        <h1 className="text-center md:text-2xl">Explora Nuestros Productos</h1>

        <div className="flex gap-x-6">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="md:w-[290px] h-fit overflow-hidden relative flex flex-col gap-y-5"
              >
                <Link
                  rel="noopener noreferrer"
                  download={false}
                  href={`/shop/${product.slug}`}
                  className="cursor-pointer size-[290px] overflow-hidden flex m-auto bg-[#fcfcfc62] border rounded-lg">
                  <Image
                    src={product.imagenes?.imagen_01?.img || "/default-product.png"}
                    alt={product.producto || "Producto sin imagen disponible"}
                    priority
                    quality={100}
                    width={240}
                    height={240}
                    className="md:size-[260px] m-auto aspect-square object-cover"
                  />
                </Link>

                <div className="flex flex-col gap-y-2">
                  <h3 className="md:text-[18px] font-normal tracking-[-0.2px] leading-5">
                    {product.producto}
                  </h3>

                  <p className="text-[20px] tracking-[-0.3px] text-nowrap font-semibold text-[#395fdb] flex gap-x-1">
                    <span className="text-[13px] tracking-[0.6px]">Lps</span>
                    {product.precio
                      ? `${parseFloat(product.precio.detalle?.toString() || "0")}.00`
                      : "No disponible"}{" "}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full">
              No hay productos disponibles.
            </p>
          )}
        </div>
      </section>

      {/* <div className="p-4 gap-2 flex flex-wrap w-fit m-auto">
        <div className="sm:bg-red-200 md:bg-blue-200 sm:w-full hover:w-[360px] cursor-pointer transition-all md:w-[300px] h-[460px] bg-gray-200 rounded-3xl"></div>
        <div className="sm:bg-red-200 md:bg-blue-200 sm:w-full hover:w-[360px] cursor-pointer transition-all md:w-[300px] h-[460px] bg-gray-200 rounded-3xl"></div>
        <div className="sm:bg-red-200 md:bg-blue-200 sm:w-full hover:w-[360px] cursor-pointer transition-all md:w-[300px] h-[460px] bg-gray-200 rounded-3xl"></div>
        <div className="sm:bg-red-200 md:bg-blue-200 sm:w-full hover:w-[360px] cursor-pointer transition-all md:w-[300px] h-[460px] bg-gray-200 rounded-3xl"></div>
      </div> */}

      <section className="w-full h-[180px] bg-black relative overflow-hidden">
        <div className="grid place-content-center absolute w-full h-full z-10">
          <h4 className="text-[#ffffff] cursor-pointer text-gradient leading-7 md:text-[28px] font-bold text-center m-auto">
            Revoluciona tu Teléfono con Accesorios
            <span className="block">de Calidad</span>
          </h4>

          <button className="text-white mt-6 hover:underline">ver mas</button>
        </div>

        <div className="flex items-end justify-center w-full h-[180px] bg-black">
          <Image
            className="object-cover m-auto"
            height={250}
            width={250}
            style={{ transform: `translateY(${offsetY * 0.024}px)` }}
            src="/images/iphone_16_pro_max.webp"
            alt="accesorios para iPhone y Samsung de la más alta calidad en San Pedro Sula - Honduras"
            quality={100}
            priority={true}
          />
          <Image
            className="object-cover m-auto"
            height={280}
            width={280}
            style={{ transform: `translateY(${offsetY * 0.024}px)` }}
            src="/images/samsung_s24_ultra.webp"
            alt="accesorios para iPhone y Samsung de la más alta calidad en San Pedro Sula - Honduras"
            quality={100}
            priority={true}
          />
        </div>
      </section>

      <section className="mt-12 p-4 flex gap-x-4 overflow-hidden gap-4 flex-wrap">
        <CategoryCards alt="Accesorios de la mas alta calidad en San Pedro Sula Honduras" imagen="/images/marcas-de-alta-calidad.webp" />
        <CategoryCards alt="Lo mejor en Audio con precios excelentes en San Pedro Sula Honduras" imagen="/images/audio-de-alta-calidad.webp" />
        <CategoryCards alt="cargadores de calidad en San Pedro Sula Honduras" imagen="/images/cargadores-de-alta-calidad.webp" />
      </section>
    </div>
  );
}
