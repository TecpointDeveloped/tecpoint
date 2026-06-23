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
  const SizeIcon = 40;
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )

  return (
    <>
      <Head>
        <title>Tecpoint - Distribuidor #1 de Accesorios Tecnológicos en Honduras</title>
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
        <meta name="description" content="Tecpoint: Distribuidor oficial de accesorios tecnológicos en Honduras. Apple, Hoco, Krieg, Hypergear. Envío 24-48h, pago al recibir. ¡Compra ahora!" />
        <meta name="keywords" content="distribuidor accesorios tecnológicos Honduras, cargadores, audífonos, cables USB, cobertores, power banks, smartwatch, envío gratis" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="language" content="es-HN" />
        <meta name="author" content="Tecpoint Distribucion" />
        <meta name="copyright" content="© 2024 Tecpoint Distribucion. Todos los derechos reservados." />
        <link rel="canonical" href="https://tecpoint.ws" />

        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Tecpoint - Distribuidor de Accesorios Tecnológicos Honduras" />
        <meta property="og:description" content="Tienda online de accesorios tech. Apple, Hoco, Krieg, Hypergear y más. Envío a todo Honduras 24-48h. Pago al recibir." />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/og_scan_and_win.webp?alt=media&token=35a959d1-f004-4dba-a565-9eb3ef9f04fa" />
        <meta property="og:image:type" content="image/webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@tecpointhn" />
        <meta name="twitter:title" content="Tecpoint - Distribuidor Accesorios Tech Honduras" />
        <meta name="twitter:description" content="Compra accesorios tecnológicos premium. Marcas oficiales, envío 24-48h, pago al recibir." />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/og_scan_and_win.webp?alt=media&token=35a959d1-f004-4dba-a565-9eb3ef9f04fa" />
        <meta name="twitter:image:alt" content="Tecpoint Distribucion Honduras" />

        <meta name="geo.region" content="HN" />
        <meta name="geo.placename" content="Honduras" />
        <meta name="geo.position" content="17.2427;-88.7589" />
      </Head>

      <NavbarMenu />

      <Carousel
        className="w-full h-auto"
        // onMouseEnter={() => plugin.current.stop()}
        // onMouseLeave={() => plugin.current.reset()}
        plugins={[plugin.current]}
        opts={{
          loop: true,
          duration: 20,
        }}
      >
        <CarouselContent>
          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <video
              className="absolute w-full h-full object-cover"
              width="100%"
              height="100%"
              autoPlay
              muted
              loop
              preload="none"
            // poster="/images/langsdom_banner.jpg"
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

            <div className="relative size-full flex items-center justify-center md:p-12 pt-10 pb-10 flex-col gap-12 backdrop-blur-[0px] bg-[#0000005e]">
              <div className="flex flex-col gap-4 md:gap-16 items-center">
                <i className="text-[#CCFD03] text-[20px] font-[900] text-center md:text-start leading-10 tracking-[-0.3px]">
                  Nueva
                  <span className="not-italic text-white block text-[40px] md:text-[60px]">
                    Marca Langsdom
                  </span>
                </i>

                <section className="flex gap-4">
                  <Link href="#LagnsdomItems" className="bg-[#CCFD03] py-2 px-5 rounded-full text-black size-fit hover:bg-transparent border-2 border-[#CCFD03] hover:text-[#fff] hover:border-white">
                    ver mas
                  </Link>
                  <Link href="/shop?page=1&brand=Langsdom&search=" className="text-[#CCFD03] py-2 px-5 hover:underline flex items-center gap-2">
                    comprar
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </section>
              </div>
            </div>
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/XO BANNER NUEVO.png" alt="Banner XO Nuevo" />
          </CarouselItem>
          
          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/BANNER DEKEN JUNIO2026.png" alt="Banner XO Nuevo" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/XO BANNER NUEVO 2.png" alt="Banner XO Nuevo 2" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/XO BANNER NUEVO 3.png" alt="Banner XO Nuevo 3" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/HOCO NUEVOS INGRESOS 1.png" alt="Banner Hoco Nuevos Ingresos 1" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/HOCO NUEVOS INGRESOS 2.png" alt="Banner Hoco Nuevos Ingresos 2" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/HOCO NUEVOS INGRESOS 3.png" alt="Banner Hoco Nuevos Ingresos 3" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/HOCO NUEVOS INGRESOS 4.png" alt="Banner Hoco Nuevos Ingresos 4" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/HOCO NUEVOS INGRESOS 5.png" alt="Banner Hoco Nuevos Ingresos 5" />
          </CarouselItem>

          <CarouselItem className="w-full h-[50vh] md:h-[74vh] relative flex">
            <Image height={690} width={1600} priority quality={100} className="absolute w-full h-full object-cover" src="/images/ho-10132 banner hoco prooducto nuevo.png" alt="Banner Hoco Producto Nuevo" />
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

      <article className="px-6 py-8 flex gap-8 md:gap-20 w-full md:w-[90%] m-auto items-center justify-center md:py-12 flex-wrap bg-white border border-gray-100 rounded-2xl shadow-sm my-6">

        <section className="flex flex-col gap-3 items-center text-center">
          <span className="rounded-2xl bg-black p-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" width={SizeIcon} height={SizeIcon} strokeWidth={1.5}>
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
              <path d="M5 17h-2v-4m-1 -8h11v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"></path>
              <path d="M3 9l4 0"></path>
            </svg>
          </span>

          <div className="flex flex-col items-center gap-1">
            <p className="font-bold text-base text-gray-900">Envios Seguros</p>
            <p className="text-gray-500 text-sm leading-5 tracking-tight">Envios a nivel nacional de<span className="block">forma rápida y segura.</span></p>
          </div>
        </section>

        <section className="flex flex-col gap-4 items-center text-center">
          <span className="rounded-2xl bg-black p-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" width={SizeIcon} height={SizeIcon} strokeWidth={1.5}>
              <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
            </svg>
          </span>

          <div className="flex flex-col items-center gap-1">
            <p className="font-bold text-base text-gray-900">Soporte Técnico</p>
            <p className="text-gray-500 text-sm leading-5 tracking-tight">Recibe soporte técnico en<span className="block">nuestras marcas.</span></p>
          </div>
        </section>

        <section className="flex flex-col gap-3 items-center text-center">
          <span className="rounded-2xl bg-black p-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" width={SizeIcon} height={SizeIcon} strokeWidth={1.5}>
              <path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
              <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2"></path>
              <path d="M12 12l0 .01"></path>
              <path d="M3 13a20 20 0 0 0 18 0"></path>
            </svg>
          </span>

          <div className="flex flex-col items-center gap-1">
            <p className="font-bold text-base text-gray-900">Venta Corporativa</p>
            <p className="text-gray-500 text-sm leading-5 tracking-tight">Recibe atención personalizada<span className="block">a la medida de tu negocio.</span></p>
          </div>
        </section>

        <section className="flex flex-col gap-3 items-center text-center">
          <span className="rounded-2xl bg-black p-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#fff" width={SizeIcon} height={SizeIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </span>

          <div className="flex flex-col items-center gap-1">
            <p className="font-bold text-base text-gray-900">Tienda Tecpoint</p>
            <p className="text-gray-500 text-sm leading-5 tracking-tight">Vive la experiencia tecnológica<span className="block">en la tienda Tecpoint.</span></p>
          </div>
        </section>

      </article>

      <section className="py-12 px-4 flex flex-col gap-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#118cff] mb-1">Nuevos</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.3px]">Cobertores iPhone 16e</h1>
        </div>

        <section className="md:max-w-[1500px] m-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {products
              .filter((product) =>
                ["BS-DH16EBL", "BS-S16EGS", "BS-PI16EBL", "BS-S16EIR"].includes(product.sku)
              )
              .slice(0, 4)
              .map((product: Product) => {
                const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

                return (
                  <div
                    key={product.id}
                    className="border border-gray-100 rounded-2xl p-4 flex flex-col w-[300px] h-[460px] relative justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                  >

                    <span className="bg-[#09f] z-[2] absolute top-4 left-4 rounded-full px-3 py-1">
                      <p className="text-[12px] font-semibold text-white">Nuevo</p>
                    </span>

                    <div className="flex flex-col">
                      <Link
                        href={`/shop/${product.slug}`}
                        className="hover:scale-105 transition-transform duration-100"
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
                          quality={100}
                          className="m-auto w-[240px] h-[240px] aspect-square object-contain mb-4"
                        />
                      </Link>

                      <div>
                        <h2 className="text-[17px] font-semibold tracking-[-0.2px] leading-[18px]">
                          {product.producto.slice(0, 50)}
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

      <section id="#LagnsdomItems" className="w-full h-fit py-12 px-4 gap-4 justify-center bg-black">
        <section className="">
          <h2 className="text-white text-[40px] font-semibold text-center mb-8">
            Lo nuevo de
            <span>
              <Image
                className="inline-block w-[240px] h-[30px] object-contain ml-2"
                src="/logos/lagnsdom.svg"
                alt="Langsdom Logo"
                width={240}
                height={60}
                quality={100}
                priority={true}
              />
            </span>
          </h2>
        </section>

        <section className="flex gap-4 justify-center flex-wrap">
          <div className="size-fit overflow-hidden rounded-2xl group relative">
            <Image
              className="w-[340px] h-[560px] object-cover hover:scale-[1.02] transition-transform duration-150"
              src="/images/categorias/productos/1.png"
              alt="Participa en nuestro gran sorteo escaneando el codigo QR"
              width={790}
              height={1370}
              quality={100}
              priority={true}
            />
            <Link
              href="/shop?page=1&brand=&search="
              className="absolute font-semibold text-sm bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#CCFD03] text-black px-6 py-2 rounded-"
            >
              Ver producto
            </Link>
          </div>

          <div className="size-fit overflow-hidden rounded-2xl group relative">
            <Image
              className="w-[340px] h-[560px] object-cover hover:scale-[1.02] transition-transform duration-150"
              src="/images/categorias/productos/BE20.jpg"
              alt="Participa en nuestro gran sorteo escaneando el codigo QR"
              width={790}
              height={1370}
              quality={100}
              priority={true}
            />
            <Link
              href="/shop?page=1&brand=&search="
              className="absolute font-semibold text-sm bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#CCFD03] text-black px-6 py-2 rounded-"
            >
              Ver producto
            </Link>
          </div>

          <div className="size-fit overflow-hidden rounded-2xl group relative">
            <Image
              className="w-[340px] h-[560px] object-cover scale-[1.05] hover:scale-[1.07] transition-transform duration-150"
              src="/images/categorias/productos/TS09.jpg"
              alt="Participa en nuestro gran sorteo escaneando el codigo QR"
              width={790}
              height={1370}
              quality={100}
              priority={true}
            />
            <Link
              href="/shop?page=1&brand=&search="
              className="absolute font-semibold text-sm bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#CCFD03] text-black px-6 py-2 rounded-"
            >
              Ver producto
            </Link>
          </div>

          <div className="size-fit overflow-hidden rounded-2xl group relative">
            <Image
              className="w-[340px] h-[560px] object-cover hover:scale-[1.02] transition-transform duration-150"
              src="/images/categorias/productos/TS28.jpg"
              alt="Participa en nuestro gran sorteo escaneando el codigo QR"
              width={790}
              height={1370}
              quality={100}
              priority={true}
            />
            <Link
              href="/shop?page=1&brand=&search="
              className="absolute font-semibold text-sm bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#CCFD03] text-black px-6 py-2 rounded-"
            >
              Ver producto
            </Link>
          </div>
        </section>
      </section>

      <section className="w-full h-[220px] bg-black relative overflow-hidden">
        <div className="grid place-content-center absolute w-full h-full z-10">
          <h4 className="text-[#ffffff] cursor-pointer leading-7 md:text-[32px] font-bold text-center m-auto tracking-tight">
            Revoluciona tu Teléfono con Accesorios
            <span className="block text-[#CCFD03]">de Calidad</span>
          </h4>
        </div>

        <div className="flex items-end justify-center w-full h-[220px] bg-black">
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
                <Link href="/shop?page=1&brand=&search=iphone" className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</Link>
                <Link href="/shop?page=1&brand=&search=iphone" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
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
                  <Link href="/shop?page=3&brand=&search=auriculares" className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</Link>
                  <Link href="/shop?page=3&brand=&search=auriculares" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
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
                  <Link href="/shop?page=1&brand=&search=smartwatch" className="bg-[#118cff] py-2 px-4 rounded-full text-white size-fit">Comprar</Link>
                  <Link href="/shop?page=1&brand=&search=smartwatch" className="text-[#118cff] py-2 px-4 hover:underline">Ver mas</Link>
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
      </section>

      <section className="w-full h-fit bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-16">
        <div className="md:w-1/2 text-center md:text-left">
          <div className="w-full flex justify-center md:justify-start mb-6">
            <Image
              className="w-full max-w-[280px] h-auto aspect-auto object-contain"
              width={400}
              height={100}
              src="/logos/rock-space.png"
              alt="Rockspace Logo"
              quality={100}
              priority={true}
            />
          </div>

          <h5 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4">
            Distribuidores Autorizados
          </h5>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
            Somos distribuidores exclusivos de la marca Rockspace, una empresa líder en la protección de pantallas. Ofrecemos una amplia gama de productos diseñados para proteger y prolongar la vida útil de tus dispositivos electrónicos. Con Rockspace, puedes estar seguro de que tus pantallas estarán siempre protegidas contra golpes, arañazos y otros daños.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            className="aspect-square object-cover rounded-lg"
            width={700}
            height={700}
            src={"/images/rockspace/zc1max.png"}
            alt="plotter - maquina de corte zc1 max rock space"
          />
        </div>
      </section>

      <div className="py-12 px-4 flex flex-col gap-y-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#118cff] mb-1">Colección</p>
          <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.3px]">Lo Mejor en SmartWatch</h3>
        </div>

        <section className="md:max-w-[1500px] m-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {products
              .filter((product) =>
                Array.isArray(product.categorias) &&
                product.categorias.some((cat) => typeof cat === "string" && cat.toLowerCase() === "reloj")
              )
              .slice(0, 4)
              .map((product: Product) => {
                const imagen_01 = product.imagenes?.imagen_01?.img || "/default-product.png";

                return (
                  <div
                    key={product.id}
                    className="border border-gray-100 rounded-2xl p-4 flex flex-col w-[300px] h-[460px] relative justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
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