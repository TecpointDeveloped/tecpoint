import Head from "next/head";
import Image from "next/image";
import NavbarMenu from "@/components/navbarmenu/page";
import LogosImages from "@/data/logos.json";

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
  return (
    <div>
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

      <div className="w-full h-[65dvh] sm:h-[75dvh] md:h-[75vh] bg-[#010101] flex flex-col items-center justify-center overflow-hidden md:gap-y-6">
        <div className="flex-1 flex-col w-full items-center justify-center flex md:items-center md:justify-end gap-y-2">
          <h3 className="text-center text-white opacity-55">iPhone 16 series</h3>
          <h2 className="text-white text-4xl tracking-[-1.4px] text-center leading-[30px]">
            Nuevos Cobertores Ghostek
          </h2>
        </div>

        <div className="px-4 md:px-12 flex items-center justify-center relative">
          <img
            alt="cobertores iPhone 16 marca ghostek"
            src="/banner_cobertores_ghostek.png"
            width="auto"
            height="auto"
            className="w-full h-[340px] z-[1] md:h-[350px] object-cover hover:scale-105 transition-transform"
          />

          <img
            alt="cobertores iPhone 16 marca ghostek"
            src="/banner_cobertores_ghostek.png"
            width="auto"
            height="auto"
            className="blur-2xl grayscale -mb-7 opacity-75 scale-110 absolute w-full h-[340px] md:h-[350px] object-cover"
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
                className={`bg-[#fafafa] hover:bg-[#f3f3f3] shadow-md w-[260px] h-[70px] 2xl:h-[80px] rounded-[8px] grid place-content-center grayscale hover:grayscale-0 cursor-pointer transition-all mx-4`}
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

      <h1>Explora Nuestros Productos</h1>
    </div>
  );
}