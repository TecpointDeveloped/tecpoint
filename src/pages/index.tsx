import Link from "next/link";
import Image from "next/image";
import NavbarMenu from "@/components/navbarmenu/page";
import LogosImages from "@/data/logos.json";
import { Product } from "@/types/ProductTypes";
import { Logo } from "@/types/ProductTypes";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../database/Config";
import Footer from "@/components/Footer/page";
import Head from "next/head";
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

export async function getServerSideProps() {
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
  };
}

interface HomeProps {
  logos: Logo[];
  products: Product[];
}

export default function Home({ logos, products }: HomeProps) {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )

  return (
    <>
      <Head>
        <title>Distribuidores de Accesorios Tecnológicos | Tecpoint</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <meta name="keywords" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta name="description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta property="og:title" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta property="og:description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
        <meta name="twitter:description" content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle." />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta name="twitter:image:alt" content="Distribuidores de Accesorios Tecnológicos | Tecpoint" />
      </Head>

      <NavbarMenu />

      <Carousel
        className="w-full h-auto z-10"
        // onMouseEnter={() => plugin.current.stop()}
        // onMouseLeave={() => plugin.current.reset()}
        plugins={[plugin.current]}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          <CarouselItem className="w-full h-[85vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="cursor-pointer absolute w-full h-full object-cover" src="/images/banner_chargers_powerpeak_grey.webp" alt="Active 8 hypergear" />
            <div className="relative size-full flex items-center justify-center bg-[#00000011] backdrop-blur-[0px] pb-10">
              <h6 className="text-white text-[30px] font-[900] leading-10 text-center tracking-[-0.3px] mix-blend-difference">Nuevos cargadores <span className="block text-[60px]">Carga Rapida</span></h6>
            </div>
          </CarouselItem>

          <CarouselItem className="w-full h-[85vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="cursor-pointer absolute w-full h-full object-cover" src="/images/bannersite_usb100w-3.webp" alt="Active 8 hypergear" />
            <div className="relative size-full flex items-center justify-center bg-[#00000011] backdrop-blur-[0px] pb-10">
              <h6 className="text-white text-[30px] font-[900] leading-10 text-center tracking-[-0.3px] mix-blend-difference">Cables USB de<span className="block text-[60px]">Marcas Certificadas</span></h6>
            </div>
          </CarouselItem>

          <CarouselItem className="w-full h-[85vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="cursor-pointer absolute w-full h-full object-cover" src="/images/new_bannersiteboulder.webp" alt="Active 8 hypergear" />
            <div className="relative size-full flex items-start pt-10 justify-center bg-[#00000011] backdrop-blur-[0px] pb-10">
              <h6 className="text-white text-[30px] font-[900] leading-10 text-center tracking-[-0.3px]">Nuevos Cobertores <span className="block text-[60px]">iPhone 16 series</span></h6>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>


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
                  className="w-[180px] h-[30px] select-none aspect-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-r from-transparent to-white h-full w-24 absolute top-0 right-0 z-10" />
      </div>

      <section className="py-8 px-4 flex flex-col gap-y-6">
        <h1 className="text-center md:text-3xl font-semibold tracking-[-0.3px]">Explora Nuestros Productos</h1>

        <section className="md:max-w-[1500px] m-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product: Product) => {
              const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

              return (
                <div
                  key={product.id}
                  className="border rounded-[26px] p-4 flex flex-col w-[300px] h-[460px] relative justify-between"
                >

                  <span className="bg-[#09f] z-[2] absolute top-4 left-4 rounded-full px-3 py-1">
                    <p className="text-[12px] font-semibold text-white">Nuevo</p>
                  </span>

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
                        className="m-auto size-[240px] aspect-square object-cover mb-4"
                        quality={100}
                        priority
                      />
                    </Link>

                    <div>
                      <h2 className="text-[17px] font-semibold tracking-[-0.2px] leading-[18px]">
                        {product.producto.slice(0, 55)}
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

                  <button className="flex mt-4 w-full bg-black text-white rounded-full hover:bg-black/80">
                    <Link className="w-full h-full py-[10px] px-4" href={`/shop/${product.slug}`}>
                      Ver Producto
                    </Link>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <section className="w-full h-[180px] bg-black relative overflow-hidden">
        <div className="grid place-content-center absolute w-full h-full z-10">
          <h4 className="text-[#ffffff] cursor-pointer text-gradient leading-7 md:text-[28px] font-bold text-center m-auto">
            Revoluciona tu Teléfono con Accesorios
            <span className="block">de Calidad</span>
          </h4>
        </div>

        <div className="flex items-end justify-center w-full h-[180px] bg-black">
          <Image
            className="m-auto aspect-square object-cover object-top"
            height={250}
            width={250}
            // style={{ transform: `translateY(${offsetY * 0.024}px)` }}
            src="/images/iphone_16_pro_max.webp"
            alt="accesorios para iPhone y Samsung de la más alta calidad en San Pedro Sula - Honduras"
            quality={100}
            priority={true}
          />
          <Image
            className="m-auto aspect-square object-cover object-top"
            height={280}
            width={280}
            // style={{ transform: `translateY(${offsetY * 0.024}px)` }}
            src="/images/samsung_s24_ultra.webp"
            alt="accesorios para iPhone y Samsung de la más alta calidad en San Pedro Sula - Honduras"
            quality={100}
            priority={true}
          />
        </div>
      </section>

      <section className="md:p-4 p-2 flex justify-center items-center flex-wrap gap-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full md:w-fit">
          <div className="h-[450px] md:h-[585px] md:w-[550px] w-full overflow-hidden relative bg-[linear-gradient(102.49deg,#e8f5ff_0%,#afdeff_100%)] rounded-[40px]">
            <div className="w-full p-4 flex flex-col items-center pt-8 gap-6 md:pt-20 md:gap-10">
              <div className="text-center">
                <h6 className="text-lg tracking-[-0.2px]">Accesorios Premium</h6>
                <h6 className="text-[38px] font-extrabold tracking-[-0.2px]">iPhone 16 series</h6>
              </div>

              <section className="flex gap-4">
                <button className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</button>
                <Link href="/shop" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
              </section>
            </div>

            <picture className="absolute bottom-0 w-full">
              <Image
                src="/images/categorias/productos/iphone_16_series.png"
                alt="Accesorios para iPhone 16 Pro Max en San Pedro Sula"
                width={500}
                height={294}
                quality={100}
                priority={true}
                className="object-cover m-auto scale-115"
              />
            </picture>
          </div>

          <div className="grid grid-rows-2 gap-6 w-full">
            <div className="relative overflow-hidden rounded-[40px] w-full h-[280px] bg-black flex flex-col">
              <div className="z-[1] absolute w-full h-full p-6 flex flex-col justify-start md:justify-center items-center md:items-start gap-6">
                <div>
                  <p className="text-white/60 mix-blend-difference text-center md:text-start">Audifonos Inalambricos</p>
                  <h5 className="text-white font-black text-[36px] tracking-[-0.4px] leading-10 mix-blend-difference text-center md:text-start">Audifonos BT</h5>
                </div>

                <div className="flex gap-4">
                  <button className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</button>
                  <Link href="/shop" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
                </div>
              </div>

              <Image
                width={280}
                height={280}
                quality={100}
                alt="Audifonos Inalambricos en san pedro sula a buen precio marca xo"
                src="/images/categorias/productos/X0 AUDIFONOS Q5.png"
                className="select-none aspect-square object-cover object-center p-3 relative md:absolute md:right-0 m-auto -mb-20 md:mb-0"
                priority={false}
              />
            </div>

            <div className="relative overflow-hidden rounded-[40px] w-full h-[280px] bg-[linear-gradient(102.49deg,#ffe2e7_0%,#ffbfce_100%)] flex flex-col">
              <div className="z-[1] absolute w-full h-full p-6 flex flex-col justify-start md:justify-center items-center md:items-start gap-6">
                <div>
                  <p className="text-black/60 mix-blend-difference text-center md:text-start">Relojes Inteligentes</p>
                  <h5 className="text-black font-black text-[36px] tracking-[-0.4px] leading-10 mix-blend-difference text-center md:text-start">SmartWatch</h5>
                </div>

                <div className="flex gap-4">
                  <button className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</button>
                  <Link href="/shop" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
                </div>
              </div>

              <Image
                width={280}
                height={280}
                quality={100}
                alt="Audifonos Q5 marca xo"
                src="/images/categorias/productos/SMARTWATCH XO.png"
                className="select-none aspect-square md:p-3 object-cover object-center relative md:absolute md:right-0 m-auto -mb-28 md:mb-0 rotate-[86deg] md:rotate-0"
                priority={false}
              />
            </div>
          </div>
        </div>

        {/* <div className="flex gap-6 md:w-[1120px]">
          <figure className="h-[300px] md:w-[780px] w-full overflow-hidden bg-[linear-gradient(102.49deg,#e3fff0_0%,#b8ffd4_100%)] rounded-[40px] relative">
            <figcaption className="z-[1] absolute w-full h-full p-6 flex flex-col justify-start md:justify-center items-center md:items-start text-center md:text-start">
              <p className="text-black/60 mix-blend-difference">Accesorios Premium</p>
              <h5 className="text-black font-black text-[36px] tracking-[-0.4px] mix-blend-difference">S24 Series</h5>

              <section className="flex gap-4 mt-6">
                <button className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</button>
                <Link href="/shop" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
              </section>
            </figcaption>

            <picture className="absolute bottom-0 md:right-0 md:w-fit w-full grid place-content-center">
              <Image
                height={250}
                width={250}
                alt="Cobertores para s24 Ultra"
                src="/images/categorias/productos/samsung s24 ultra.png"
                className="scale-115 -mb-16"
              />
            </picture>
          </figure>

          <figure className="h-[300px] w-full overflow-hidden bg-[linear-gradient(102.68deg,#fef4e0_0%,#ffdead_99.61%)] rounded-[40px] relative">
            <picture className="absolute bottom-0 right-0">
              <Image
                height={250}
                width={250}
                alt="Cobertores para s24 Ultra"
                src="/images/categorias/productos/samsung s24 ultra.png"
                className="scale-115 -mb-16"
              />
            </picture>
          </figure>
        </div> */}
      </section>

      <section className="flex flex-col md:flex-row p-2 gap-2">
        <picture className="flex items-center justify-center relative cursor-pointer overflow-hidden group md:rounded-[60px]">
          <Image
            className="aspect-square object-cover"
            width={800}
            height={800}
            src={"/images/rockspace/zc1max.png"}
            alt="plotter - maquina de corte zc1 max rock space"
          />
          <span className="bg-[#23b7ce8f] inset-0 backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Image
              width={240}
              height={285}
              alt="logo rock space"
              src="/logos/rock-space-white.png"
              className="mb-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            />

            <p
              className="text-center md:font-black md:text-3xl tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            >
              Plotter ZC1 MAX
            </p>
          </span>
        </picture>

        <picture className="flex items-center justify-center relative cursor-pointer overflow-hidden group md:rounded-[60px]">
          <Image
            className="aspect-square object-cover"
            width={800}
            height={800}
            src={"/images/rockspace/zv2.png"}
            alt="plotter - maquina de corte zv2 mini rock space"
          />
          <span className="bg-[#23b7ce8f] inset-0 backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Image
              width={240}
              height={285}
              alt="logo rock space"
              src="/logos/rock-space-white.png"
              className="mb-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            />

            <p
              className="text-center md:font-black md:text-3xl tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            >
              Plotter MINI ZV2
            </p>
          </span>
        </picture>

        <picture className="flex items-center justify-center relative cursor-pointer overflow-hidden group md:rounded-[60px]">
          <Image
            className="aspect-square object-cover"
            width={800}
            height={800}
            src={"/images/rockspace/zc3.png"}
            alt="plooter - maquina de corte zv1 mini rock space"
          />
          <span className="bg-[#23b7ce8f] inset-0 backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Image
              width={240}
              height={285}
              alt="logo rock space"
              src="/logos/rock-space-white.png"
              className="mb-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            />

            <p
              className="text-center md:font-black md:text-3xl tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            >
              Plotter MINI ZV1
            </p>
          </span>
        </picture>
      </section>

      <div className="py-8 px-4 flex flex-col gap-y-6">
        <h3 className="text-center md:text-3xl font-semibold tracking-[-0.3px]">Productos Recomendados</h3>

        <section className="md:max-w-[1500px] m-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products
              .sort((a, b) => Number(b.precio.detalle) - Number(a.precio.detalle))
              .slice(0, 4)
              .map((product: Product) => {
                const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

                return (
                  <div
                    key={product.id}
                    className="border rounded-[26px] p-4 flex flex-col w-[300px] h-[460px] relative justify-between"
                  >

                    <span className="bg-[#09f] z-[2] absolute top-4 left-4 rounded-full px-3 py-1">
                      <p className="text-[12px] font-semibold text-white">Nuevo</p>
                    </span>

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
                          className="m-auto size-[240px] aspect-square object-cover mb-4"
                          quality={100}
                          priority
                        />
                      </Link>

                      <div>
                        <h2 className="text-[17px] font-semibold tracking-[-0.2px] leading-[18px]">
                          {product.producto.slice(0, 55)}
                        </h2>
                        <p className="text-lg font-bold mt-2 text-[#666666]">
                          Lps: {product.precio.detalle}.00
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

                    <button className="flex mt-4 w-full bg-black text-white rounded-full hover:bg-black/80">
                      <Link className="w-full h-full py-[10px] px-4" href={`/shop/${product.slug}`}>
                        Ver Producto
                      </Link>
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}