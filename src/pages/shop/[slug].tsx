import Head from "next/head";
import Image from "next/image";
import Banners from "@/data/banners.json";
import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";
import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import { Product, BannerInterface } from "../../types/ProductTypes";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProductDetailProps {
  product: Product | null;
  Banners: BannerInterface[]
}

interface CartItem {
  id: string;
  quantity: number;
  sku?: string;
  imagenes?: object;
  precio?: number;
  producto?: string;
}

const ProductDetail = ({ product, Banners }: ProductDetailProps) => {
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showRemaining, setShowRemaining] = useState(false);

  useEffect(() => {
    if (product) {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("cart_tecpoint") || "[]");
      const isProductInCart = cart.some((item) => item.id === product.id);
      setIsAddedToCart(isProductInCart);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("cart_tecpoint") || "[]");

      if (!cart.some((item) => item.id === product.id)) {
        cart.push({
          id: product.id,
          quantity,
          sku: product.sku,
          precio: parseFloat(product.precio.detalle?.toString() || "0"),
          imagenes: product.imagenes || {},
          producto: product.producto || "Producto no Encontrado"
        });
      } else {
        cart.forEach((item) => {
          if (item.id === product.id) item.quantity += quantity;
        });
      }
      localStorage.setItem("cart_tecpoint", JSON.stringify(cart));
      setIsAddedToCart(true);
    }
  };

  const handleQuantityChange = (operation: "increase" | "decrease") => {
    setQuantity((prev) =>
      operation === "increase" ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
  };

  if (!product) {
    return <p className="text-center">Producto no encontrado</p>;
  }

  const imagenesArray = Object.entries(product.imagenes || {})
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, value]) => value);

  const primaryImage = imagenesArray[0]?.img || "/default-product.png";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.producto || "",
    sku: product.sku || "",
    image: primaryImage || "",
    description: product.descripcion || "",
    brand: {
      "@type": "Brand",
      name: product.marca_producto?.marca || "Marca no disponible",
    },
    offers: {
      "@type": "Offer",
      url: `https://tecpoint.ws/shop/${product.slug}` || "#",
      priceCurrency: "HNL",
      price: product.precio?.detalle || 0,
      availability:
        product.extradata?.stock === true
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const handleToggleImages = () => {
    setShowRemaining((prevState) => !prevState);
  };

  const imagesToShow = showRemaining
    ? imagenesArray.slice(2) // Mostrar imágenes faltantes
    : imagenesArray.slice(0, 3); // Mostrar primeras tres imágenes

  const banner = Banners.find((banner) => banner.marca === product.marca_producto?.marca) || {
    color: "000000", // Color predeterminado en caso de no encontrar la marca
    ImageBanner: "/default-banner.png", // Banner predeterminado
  };

  return (
    <div className="w-full">
      <NavbarMenu />

      <Head>
        <title>{product.producto || "Producto no Encontrado"}</title>
        <meta name="keywords" content={product.descripcion || ""} />
        <meta name="description" content={product.descripcion || ""} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.producto} />
        <meta property="og:description" content={product.descripcion || ""} />
        <meta property="og:url" content={`https://tecpoint.vercel.app/shop/${product.slug}`} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.producto} />
        <meta name="twitter:description" content={product.descripcion || ""} />
        <meta name="twitter:image" content={primaryImage} />
        <meta name="twitter:image:alt" content={product.producto || "Imagen del producto"} />

        <link rel="canonical" href={`https://tecpoint.vercel.app/shop/${product.slug}`} />
      </Head>

      <main className="flex flex-col sm:flex-col md:flex-row h-fit w-full gap-x-28 justify-center items-center overflow-hidden">
        <div className="flex flex-col gap-y-3 p-2 sm:pt-4">
          <Carousel className="border rounded-md">
            <CarouselContent className="size-[380px] md:size-[500px] aspect-square">
              {imagenesArray?.map((img, index) => (
                <CarouselItem key={index}>
                  <Image
                    quality={100}
                    priority={true}
                    src={img.img || "/default-product.png"}
                    alt={product.producto || `Imagen ${index + 1}`}
                    className="size-[380px] md:size-[500px] aspect-square object-cover"
                    width={1100}
                    height={1100}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="flex p-2 md:p-0 w-full gap-x-2 flex-1 overflow-y-scroll sm:overflow-hidden md:overflow-hidden">
            {imagesToShow.map((img, index) => (
              <Image
                key={index}
                quality={100}
                priority={true}
                src={img.img || "/default-product.png"}
                alt={product.producto || `Imagen ${index + 1}`}
                className="size-[110px] md:size-[110px] aspect-square object-cover border cursor-pointer"
                width={110}
                height={110}
              />
            ))}

            {/* Cuadro adicional para alternar entre las primeras y las restantes imágenes */}
            {imagenesArray.length > 3 && !showRemaining && (
              <div
                className="size-[110px] md:size-[110px] aspect-square flex items-center justify-center border bg-gray-200 cursor-pointer"
                onClick={handleToggleImages}
              >
                <span className="text-sm font-medium text-gray-600">
                  +{imagenesArray.length - 3}
                </span>
              </div>
            )}

            {/* Botón para volver a las primeras imágenes */}
            {showRemaining && (
              <div
                className="size-[110px] md:size-[110px] aspect-square flex items-center justify-center border bg-gray-200 cursor-pointer"
                onClick={handleToggleImages}
              >
                <span className="text-sm font-medium text-gray-600">Ver menos</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-[40%] w-full p-3">
          <div className="flex flex-col gap-y-5">
            <Image
              quality={96}
              src={product.marca_producto?.logo || "/default-logo.png"}
              alt={`Logo de marca ${product.marca_producto?.marca || "desconocida"}`}
              height={300}
              width={300}
              priority
              className="h-[28px] w-fit"
            />
            <h1 className="text-2xl font-semibold md:w-[650px] leading-8 2xl:text-4xl">
              {product.producto}
            </h1>

            <Separator />
          </div>

          <div className="flex flex-col gap-y-3 mt-3">
            <span className="flex justify-center items-center gap-x-2 w-fit">
              <p className="bg-black w-fit h-fit md:text-[12px] 2xl:text-[17px] px-3 py-1 text-white rounded-[4px]">
                SKU
              </p>
              <p className="text-md font-bold 2xl:text-[20px]">{product.sku}</p>
            </span>

            <span className="flex flex-col">
              <p className="text-[#696969]">Precio</p>
              <p className="text-2xl font-bold leading-4">
                {product.precio.detalle}.00
              </p>
            </span>
          </div>

          <div className="flex items-center gap-x-2 mt-6">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="px-4 py-1 border"
            >
              -
            </button>
            <span className="text-lg font-semibold w-[30px] text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="px-4 py-1 border"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex gap-x-3 mt-6 px-16 items-center justify-center py-3 text-black rounded-[6px] w-full sm:w-fit md:w-fit
              ${isAddedToCart
              ? "bg-transparent border-[1.4px] border-black text-black"
              : "bg-black text-white hover:bg-transparent border-black border-[1.4px] hover:text-black transition-colors"
              }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>

            {/* {isAddedToCart ? "Producto en el carrito" : "Agregar al carrito"} */}
            Agregar al carrito
          </button>
        </div>
      </main>

      <section
        style={{ backgroundColor: `#${banner.color}` }}
        className="overflow-hidden px-8 w-full h-24 md:h-36 grid place-content-center relative mt-12"
      >
        <h2 className="md:text-[28px] text-[20px] font-normal text-center text-white tracking-[-0.2px] md:leading-[28px] z-[1] md:w-[500px]">
          {product.producto}
        </h2>

        <span className="w-full h-fit flex items-center justify-center absolute bottom-[-28px]">
          <Image
            className="h-[100%] opacity-30 select-none"
            src={banner.ImageBanner || ""}
            alt="Banner del producto"
            width={700}
            height={700}
          />
        </span>
      </section>

      <article className="flex flex-col">
        <div className="w-full p-3 py-6">
          <h2 className="text-center md:text-3xl font-semibold tracking-[-0.5px]">Especificaciones</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-8 max-w-[1200px] m-auto px-4">
          {Object.entries(product.extradata?.especificaciones || {}).map(([key, value]) => (
            <Accordion type="single" collapsible key={key} className="w-[300px] sm:w-[260px] md:w-[300px]">
              <AccordionItem value={key}>
                <AccordionTrigger className="font-bold text-[20px] sm:text-[20px] md:text-[20px]">{key}</AccordionTrigger>
                <AccordionContent>
                  <p className=" text-[18px] sm:text-[15px] md:text-[16px]">{value}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>

        <section className="bg-[#ECECEC] flex flex-col md:gap-y-12 md:mt-10">
          <div className="flex gap-x-2 p-3 justify-center">
            {/* Primera Sección */}
            {product.secciones?.seccion_01.imagenUrl ?
              <picture className="flex items-center justify-center relative cursor-pointer overflow-hidden group">
                <Image
                  className="md:size-[600px] aspect-square object-cover"
                  width={800}
                  height={800}
                  src={product.secciones?.seccion_01.imagenUrl || "/default-product.png"}
                  alt=""
                />
                <span className="md:size-[600px] inset-0 bg-[#000000a4] backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p
                    className="text-center md:font-black md:text-3xl md:w-[280px] tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
                  >
                    {product.secciones?.seccion_01.title}
                  </p>
                </span>
              </picture> : null
            }

            {/* Segunda Sección */}
            {product.secciones?.seccion_02.imagenUrl ?
              <picture className="flex items-center justify-center relative cursor-pointer overflow-hidden group">
                <Image
                  className="md:size-[600px] aspect-square object-cover"
                  width={800}
                  height={800}
                  src={product.secciones?.seccion_02.imagenUrl || "/default-product.png"}
                  alt=""
                />
                <span className="md:size-[600px] inset-0 bg-[#000000a4] backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p
                    className="text-center md:font-black md:text-3xl md:w-[280px] tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out"
                  >
                    {product.secciones?.seccion_02.title}
                  </p>
                </span>
              </picture> : null
            }
          </div>

          <section className="flex flex-col gap-4 sm:flex-row md:flex-row p-3 items-center justify-center">
            {product.secciones?.ficha_descriptiva.ficha_image.trim() ?
              <picture className="md:size-[600px] overflow-hidden rounded-3xl">
                <Image
                  src={product.secciones?.ficha_descriptiva.ficha_image.trim() || "/default-product.png"}
                  width={800}
                  height={800}
                  alt="Ficha descriptiva"
                  className="hover:scale-110 transition-transform"
                  quality={100}
                  priority
                />
              </picture> : null
            }

            {product.secciones?.ficha_descriptiva ?
              <div className="w-full md:w-[600px] md:pl-12 flex flex-col gap-y-4 md:gap-y-6 text-balance">
                <h3 className="text-3xl md:text-[38px] font-black">
                  {product.secciones?.ficha_descriptiva.ficha_title}
                </h3>
                <p className="text-[17px] md:text-[20px] tracking-[-0.4px] text-[#3c3c3c]">
                  {product.secciones?.ficha_descriptiva.ficha_description}
                </p>
              </div> : null
            }
          </section>
        </section>

      </article>

      <Footer />
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string)
    );

    const paths = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        if (data.slug) {
          return { params: { slug: data.slug } };
        }
        return null;
      })
      .filter(Boolean);

    return {
      paths: paths as { params: { slug: string } }[],
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error fetching paths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return {
      notFound: true,
    };
  }

  try {
    const productsRef = collection(
      db,
      process.env.NEXT_PUBLIC_DATABASE_NAME as string
    );
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      const serializedData = {
        ...data,
        id: doc.id,
        fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
      };

      return {
        props: {
          product: serializedData,
          Banners
        },
        revalidate: 30,
      };
    } else {
      return { notFound: true };
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return { notFound: true };
  }
};

export default ProductDetail;