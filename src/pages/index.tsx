import Head from "next/head";
import Image from "next/image";
import NavbarMenu from "@/components/navbarmenu/page";
import LogosImages from "@/data/logos.json";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { Product } from "@/types/ProductTypes";

type Logo = {
  key: string;
  logo: string;
  color?: string;
};

export async function getStaticProps() {
  return {
    props: {
      logos: LogosImages as Logo[],
    },
    revalidate: 60,
  };
}

interface HomeProps {
  logos: Logo[];
}

export default function Home({ logos = [] }: HomeProps) {
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

  const { products } = useAuth();

  return (
    <div className="pb-[600px]">
      <Head>
        <title>Distribuidores de Accesorios Tecnológicos | Tecpoint</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        <meta
          name="description"
          content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle."
        />
        <meta
          property="og:title"
          content="Distribuidores de Accesorios Tecnológicos | Tecpoint"
        />
        <meta
          property="og:description"
          content="Distribuidor de accesorios tecnológicos en Honduras. Cargadores, adaptadores, audífonos, periféricos y más, al por mayor y al detalle."
        />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:image" content="/og-image.png" />
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
            sizes="(min-width: 1536px) 390px, (min-width: 768px) 390px, 340px"
            className="w-fit h-[340px] z-[1] md:h-[390px] 2xl:h-[390px] object-cover hover:scale-105 transition-transform"
          />

          <Image
            alt="cobertores iPhone 16 marca ghostek"
            src="/banner_cobertores_ghostek.png"
            width={390}
            height={390}
            sizes="(min-width: 1536px) 480px, (min-width: 768px) 390px, 340px"
            className="blur-2xl grayscale select-none -mb-7 opacity-75 scale-110 absolute w-[390px] md:h-[390px] 2xl:h-[480px] object-cover"
          />
        </div>
      </div>

      <div className="relative overflow-hidden w-full md:w-full lg:max-w-[1900px] py-4 m-auto">
        <div className="bg-gradient-to-r from-white to-transparent h-full w-24 absolute top-0 left-0 z-10" />
        <div className="marquee h-[120px]">
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

      <section className="py-8 px-4 bg-gray-100 flex flex-col gap-y-6">
        <h1 className="text-center md:text-2xl">Explora Nuestros Productos</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products && products.length > 0 ? (
            products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white md:w-[300px] h-[430px] rounded-lg overflow-hidden relative px-4"
              >
                <p className="text-[15px] absolute top-3">{product.marca_producto.marca}</p>

                <picture className="size-[260px] overflow-hidden flex m-auto">
                  <Image
                    src={product.imagenes?.imagen_01?.img || "/default-product.png"}
                    alt={product.producto || "producto con imagen no dispoinble"}
                    priority
                    quality={100}
                    width={240}
                    height={240}
                    className="md:size-[240px] m-auto aspect-square object-cover"
                  />
                </picture>

                <h3 className="md:text-[17px] font-semibold tracking-[-0.2px] leading-5">{product.producto}</h3>

                <div className="absolute bottom-0 w-full left-0 pl-3 pr-3 pb-4">
                  <div className="flex items-center gap-x-4 justify-between mt-3">
                    <div className="bg-[#ebebeb] size-fit py-1 px-3 rounded-[4px]">
                      <p className="text-[13px] font-[600]">{product.sku}</p>
                    </div>

                    <p className="font-bold text-[17px]">
                      {product.precio ? product.precio.detalle.toFixed(2) : "No disponible"} L
                    </p>
                  </div>

                  <div className="w-full">
                    <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-black/80 transition-colors">
                      Ver detalles
                    </button>
                  </div>
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

      <section className="mb-32 w-full h-[180px] bg-black relative overflow-hidden">
        <div className="grid place-content-center absolute w-full h-full z-10">
          <h4 className="text-[#ffffff] leading-7 md:text-[28px] font-bold text-center m-auto">
            Revoluciona tu Teléfono con Accesorios
            <span className="block">de Calidad</span>
          </h4>

          <button className="text-white mt-6">ver mas</button>
        </div>

        <div className="flex items-end justify-center w-full h-[180px] bg-black">
          <Image
            className="object-cover m-auto"
            height={250}
            width={250}
            style={{ transform: `translateY(${offsetY * 0.04}px)` }} // Movimiento dinámico
            src="/images/iphone_16_pro_max.webp"
            alt="accesorios para iPhone y Samsung de la más alta calidad en San Pedro Sula - Honduras"
            quality={100}
            priority
          />
          <Image
            className="object-cover m-auto"
            height={250}
            width={250}
            style={{ transform: `translateY(${offsetY * 0.04}px)` }} // Movimiento más lento
            src="/images/samsung_s24_ultra.webp"
            alt="accesorios para iPhone y Samsung de la más alta calidad en San Pedro Sula - Honduras"
            quality={100}
            priority
          />
        </div>
      </section>
    </div>
  );
}