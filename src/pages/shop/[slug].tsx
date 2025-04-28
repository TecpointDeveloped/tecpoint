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
import { useCartStore } from "../../lib/cartStore";

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
      fallback: true,
    };
  } catch (error) {
    console.error("Error fetching paths:", error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
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

      const productBanner = Banners.find((banner) => banner.marca === data.marca_producto?.marca);

      return {
        props: {
          product: serializedData,
          Banners: productBanner ? [productBanner] : [],
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

const ProductDetail = ({ product, Banners }: ProductDetailProps) => {
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showRemaining, setShowRemaining] = useState(false);
  const [added, setAdded] = useState(false);
  // const route = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    if (product && product.imagenes && Object.keys(product.imagenes).length > 0) {
      addToCart({
        id: product.id,
        quantity: quantity,
        sku: product.sku,
        imagenes: Object(product.imagenes),
        precio: Number(product.precio.detalle),
        producto: product.producto,
      });
    }
  };

  useEffect(() => {
    if (product) {
      const cart: CartItem[] = JSON.parse(localStorage.getItem("cart_tecpoint") || "[]");
      if (!Array.isArray(cart)) {
        setIsAddedToCart(false);
        return;
      }
      const isProductInCart = cart.some((item) => item.id === product.id);
      setIsAddedToCart(isProductInCart);
    }
  }, [product]);

  // const handlePayNow = () => {
  //   if (product) {
  //     addToCart({
  //       id: product.id,
  //       quantity,
  //       sku: product.sku,
  //       imagenes: Object(product.imagenes),
  //       precio: parseFloat(product.precio.detalle?.toString() || "0"),
  //       producto: product.producto || "Producto no Encontrado"
  //     });
  //     route.push("/cart");
  //     setIsAddedToCart(true);
  //   }
  // };

  const handleQuantityChange = (operation: "increase" | "decrease") => {
    setQuantity((prev) => {
      if (operation === "increase") {
        if ((Number(product?.precio.detalle ?? 0) > 1000) && prev >= 10) {
          setAdded(true);
          return prev;
        }
        return prev + 1;
      } else {
        setAdded(false);
        return prev > 1 ? prev - 1 : 1;
      }
    });
  };

  if (!product) {
    return (
      <div>
        <NavbarMenu />

        <div className="h-[70vh] w-full grid place-content-center">
          <p className="text-center">Producto no encontrado</p>
        </div>
        <Footer />
      </div>
    );
  }

  const imagenesArray = Object.entries(product.imagenes || {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([, value]) => value);
  const primaryImage = imagenesArray[0]?.img || "https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338";

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

  const imagesToShow = showRemaining ? imagenesArray.slice(2) : imagenesArray.slice(0, 3);

  const banner = Banners.find((banner) => banner.marca === product.marca_producto?.marca) || {
    color: "000000",
    ImageBanner: "/default-banner.png",
  };

  return (
    <>
      <Head>
        <title>{product.producto || "Producto no Encontrado"}</title>
        <meta name="keywords" content={product.descripcion || "keywords no generad"} />
        <meta name="description" content={product.descripcion || "descripcion no generada"} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={product.producto} />
        <meta property="og:description" content={product.descripcion || ""} />
        <meta property="og:url" content={`https://tecpoint.ws/shop/${product.slug}`} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.producto} />
        <meta name="twitter:description" content={product.descripcion || ""} />
        <meta name="twitter:image" content={primaryImage} />
        <meta name="twitter:image:alt" content={product.producto || "Imagen del producto"} />

        <link rel="canonical" href={`https://tecpoint.ws/shop/${product.slug}`} />
      </Head>

      <NavbarMenu bgColor="black" />

      <main className="mt-[70px]">
        <section className="flex flex-col lg:flex-row h-fit w-full gap-x-28 justify-center items-center overflow-hidden">
          <div className="flex flex-col gap-y-3 p-2 sm:pt-4">

            <Carousel className="border rounded-xl flex-1 sm:size-[480px] md:size-[500px]" opts={{ loop: true }}>
              <CarouselContent className="">
                {imagenesArray.length > 0 ?
                  imagenesArray.map((img: { img: string }, index: number) => (
                    <CarouselItem key={index}>
                      <Image
                        rel="noopener noreferrer"
                        quality={100}
                        priority={true}
                        src={img.img || "/default-product.png"}
                        alt={product.producto || `Imagen ${index + 1}`}
                        className="flex-1 sm:size-[480px] md:size-[500px] aspect-square object-contain rounded-xl"
                        width={1100}
                        height={1100}
                      />
                    </CarouselItem>
                  )) :
                  <Image width={1100} height={1100} src="/default-product.png" className="flex-1 sm:size-[480px] md:size-[500px] aspect-square object-contain rounded-xl" alt="Default product image" />
                }
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
                  className="size-[110px] md:size-[110px] aspect-square object-cover border cursor-pointer rounded-lg"
                  width={110}
                  height={110}
                />
              ))}

              {/* Cuadro adicional para alternar entre las primeras y las restantes imágenes */}
              {imagenesArray.length > 3 && !showRemaining && (
                <div
                  className="size-[110px] md:size-[110px] rounded-lg aspect-square flex items-center justify-center border bg-gray-200 cursor-pointer"
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
                  className="size-[110px] md:size-[110px] rounded-lg aspect-square flex items-center justify-center border bg-gray-200 cursor-pointer"
                  onClick={handleToggleImages}
                >
                  <span className="text-sm font-medium text-gray-600">Ver menos</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-[40%] p-3">
            <div className="flex flex-col gap-y-5">
              <Image
                quality={96}
                src={banner.ImageBanner || "/default-logo.png"}
                alt={`Logo de marca ${product.marca_producto?.marca || "desconocida"}`}
                height={28}
                width={150}
                priority
                unoptimized={true}
                className="h-[28px] w-[150px] aspect-[28/150] object-contain object-left"
              />
              <h1 className="text-[26px] font-semibold md:w-[450px] lg:w-[560px] leading-8 2xl:text-4xl">
                {product.producto}
              </h1>

              <Separator />
            </div>

            <div className="flex flex-col gap-y-3 mt-3">
              <span className="flex justify-center items-center gap-x-2 w-fit">
                <p className="bg-black tracking-[-0.4px] w-fit h-fit md:text-[12px] 2xl:text-[17px] px-3 py-1 text-white rounded-[6px]">
                  SKU
                </p>
                <p className="text-md font-bold 2xl:text-[20px]">{product.sku}</p>
              </span>

              <span>
                {product.extradata?.stock ? (
                  <div className="bg-[#72ff56] w-fit px-4 py-1 rounded-[8px]">
                    <p className="font-bold text-[14px] text-[#287518]">Disponible</p>
                  </div>
                ) : (
                  <div className="bg-[#fcb9b9] w-fit px-4 py-1 rounded-[8px]">
                    <p className="text-[#b51d1d] font-bold text-[14px]">Agotado</p>
                  </div>
                )}
              </span>

              <div className="flex gap-x-12 md:py-4">
                <span className="flex flex-col">
                  <p className="text-[#696969]">Precio Detalle</p>
                  <p className="text-2xl font-bold leading-4">
                    {product.precio.detalle}.00
                  </p>
                </span>

                {/* <span className="flex flex-col">
                <p className="text-[#696969]">Precio Mayoreo</p>
                <p className="text-2xl font-bold leading-4 text-[#42c928]">
                  {product.precio.mayoreo}.00
                </p>
              </span> */}
              </div>
            </div>

            <div className="flex items-center gap-x-2 mt-6">
              <button
                onClick={() => handleQuantityChange("decrease")}
                className="size-10 border rounded-[10px] text-lg hover:bg-[#ebebeb]"
              >
                -
              </button>
              <span className="text-lg font-semibold w-[30px] text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange("increase")}
                className={`size-10 border rounded-[10px] text-lg ${added ? "bg-gray-200 cursor-not-allowed border-none" : "hover:bg-[#ebebeb]"}`}
                disabled={added}
              >
                +
              </button>
            </div>

            <div className="w-full flex flex-col mt-6 md:w-[470px]">
              <button
                onClick={handleAddToCart}
                className={`flex gap-x-3 px-16 items-center justify-center py-3 rounded-[6px] w-full bg-black text-white hover:bg-transparent border-black border-[1.4px] hover:text-black transition-colors`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>

                {isAddedToCart ? "Agregar otra vez" : "Agregar al carrito"}
              </button>

              {/* <button
              onClick={handlePayNow}
              className={`flex gap-x-3 mt-1 px-16 items-center justify-center py-3 rounded-[6px] w-full 
                bg-black text-white hover:bg-transparent border-black border-[1.4px] hover:text-black transition-colors
                `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
              pagar ahora
            </button> */}

              <button
                onClick={() => {
                  const message = `https://tecpoint.ws/shop/${product.slug}\n\nHola Tecpoint, quiero ordenar un: \n \n${product.producto}\nSKU : ${product.sku}\ncantidad : ${quantity}`;
                  const whatsappUrl = `https://wa.me/50497157784?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, "_blank");
                }}
                className={`flex gap-x-3 mt-1 px-16 items-center justify-center py-3 rounded-[6px] w-full 
              bg-[#25d366] text-white hover:bg-[#2cc564af] transition-colors
              `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.693 56.693" width="26" height="26" fill="currentColor">
                  <style type="text/css">
                    {`
              .st0 { fill-rule:evenodd; clip-rule:evenodd; }
              `}
                  </style>
                  <g>
                    <path className="st0" d="M46.3802,10.7138c-4.6512-4.6565-10.8365-7.222-17.4266-7.2247c-13.5785,0-24.63,11.0506-24.6353,24.6333c-0.0019,4.342,1.1325,8.58,3.2884,12.3159l-3.495,12.7657l13.0595-3.4257c3.5982,1.9626,7.6495,2.9971,11.7726,2.9985h0.01c0.0008,0-0.0006,0,0.0002,0c13.5771,0,24.6293-11.0517,24.635-24.6347C53.5914,21.5595,51.0313,15.3701,46.3802,10.7138z M28.9537,48.6163h-0.0083c-3.674-0.0014-7.2777-0.9886-10.4215-2.8541l-0.7476-0.4437l-7.7497,2.0328l2.0686-7.5558l-0.4869-0.7748c-2.0496-3.26-3.1321-7.028-3.1305-10.8969c0.0044-11.2894,9.19-20.474,20.4842-20.474c5.469,0.0017,10.6101,2.1344,14.476,6.0047c3.8658,3.8703,5.9936,9.0148,5.9914,14.4859C49.4248,39.4307,40.2395,48.6163,28.9537,48.6163z" />
                    <path className="st0" d="M40.1851,33.281c-0.6155-0.3081-3.6419-1.797-4.2061-2.0026c-0.5642-0.2054-0.9746-0.3081-1.3849,0.3081c-0.4103,0.6161-1.59,2.0027-1.9491,2.4136c-0.359,0.4106-0.7182,0.4623-1.3336,0.1539c-0.6155-0.3081-2.5989-0.958-4.95-3.0551c-1.83-1.6323-3.0653-3.6479-3.4245-4.2643c-0.359-0.6161-0.0382-0.9492,0.27-1.2562c0.2769-0.2759,0.6156-0.7189,0.9234-1.0784c0.3077-0.3593,0.4103-0.6163,0.6155-1.0268c0.2052-0.4109,0.1027-0.7704-0.0513-1.0784c-0.1539-0.3081-1.3849-3.3379-1.8978-4.5706c-0.4998-1.2001-1.0072-1.0375-1.3851-1.0566c-0.3585-0.0179-0.7694-0.0216-1.1797-0.0216s-1.0773,0.1541-1.6414,0.7702c-0.5642,0.6163-2.1545,2.1056-2.1545,5.1351c0,3.0299,2.2057,5.9569,2.5135,6.3676c0.3077,0.411,4.3405,6.6282,10.5153,9.2945c1.4686,0.6343,2.6152,1.013,3.5091,1.2966c1.4746,0.4686,2.8165,0.4024,3.8771,0.2439c1.1827-0.1767,3.6419-1.489,4.1548-2.9267c0.513-1.438,0.513-2.6706,0.359-2.9272C41.211,33.7433,40.8006,33.5892,40.1851,33.281z" />
                  </g>
                </svg>
                Ordenar Ahora
              </button>
            </div>

            <div className="mt-3">
              {Number(product.precio.detalle) > 1200 ?
                (
                  <span className="flex items-center justify-center gap-4 w-fit border px-6 py-3 select-none">
                    <Image unoptimized={true} className="aspect-square" height={30} width={30} src="/icons/truck.svg" alt="entrega gratis en tu compra - tecpoint distribucion" />
                    <span>
                      <p className="font-bold">Envio Gratis</p>
                      <p className="leading-3">Incluye Envio Gratis a todo el pais al comprar</p>
                    </span>
                  </span>
                )
                : (
                  <span className="flex items-center justify-center gap-1 w-fit">
                    <Image unoptimized={true} className="aspect-square" height={24} width={24} src="/icons/info.svg" alt="entrega gratis en tu compra - tecpoint distribucion" />
                    <p>Faltan Lps {1200 - Number(product.precio.detalle)} para entrega gratis</p>
                  </span>
                )
              }
            </div>
          </div>
        </section>

        <section
          style={{ backgroundColor: `#${banner.color}` }}
          className="overflow-hidden px-8 w-full h-24 md:h-36 grid place-content-center relative mt-12"
        >
          <h2 className="md:text-[28px] font-semibold text-[20px] text-center text-white tracking-[-0.2px] md:leading-[28px] z-[1] md:w-[500px]">
            {product.producto}
          </h2>

          <span className="w-full h-fit flex items-center justify-center absolute bottom-[-28px]">
            <Image
              className="h-[100%] opacity-30 select-none"
              src={banner.ImageBanner || ""}
              alt="Banner del producto"
              width={700}
              height={700}
              unoptimized={true}
            />
          </span>
        </section>

        <article className="flex flex-col">
          <div className="w-full p-3 py-6">
            <h2 className="text-center text-2xl md:text-3xl font-semibold tracking-[-0.5px]">Especificaciones</h2>
          </div>

          <div className="grid grid-cols-1 gap-x-20 gap-y-8 max-w-[1200px] m-auto px-4 w-full mb-4">
            {Object.entries(product.extradata?.especificaciones || {}).map(([key, value]) => (
              <Accordion type="single" collapsible key={key} className="md:w-[800px] m-auto w-full">
                <AccordionItem value={key}>
                  <AccordionTrigger className="font-bold text-[20px] md:text-[24px]">{key}</AccordionTrigger>
                  <AccordionContent className="bg-gray-100 p-5 rounded-lg">
                    <p className="md:w-[70%] text-gray-500 text-[18px] md:text-[17px] tracking-[-0.4px]">{value}</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>

          <section
            className={`bg-[#ECECEC] flex flex-col md:gap-y-12 md:mt-10 ${(!product.secciones?.seccion_01.imagenUrl || typeof product.secciones?.seccion_01.imagenUrl !== 'string' || !product.secciones?.seccion_01.imagenUrl.trim()) &&
              (!product.secciones?.seccion_02.imagenUrl || typeof product.secciones?.seccion_02.imagenUrl !== 'string' || !product.secciones?.seccion_02.imagenUrl.trim()) &&
              (!product.secciones?.ficha_descriptiva?.ficha_image || typeof product.secciones?.ficha_descriptiva?.ficha_image !== 'string' || !product.secciones?.ficha_descriptiva?.ficha_image.trim()) ? 'hidden' : ''}`}
          >
            <div className="flex flex-col sm:flex-row gap-2 p-3 justify-center m-auto w-full max-w-[1600px]">
              {/* Primera Sección */}
              {product.secciones?.seccion_01.imagenUrl && typeof product.secciones?.seccion_01.imagenUrl === 'string' && product.secciones?.seccion_01.imagenUrl.trim() && product.secciones?.seccion_01.title?.trim() ? (
                <div className="flex size-full sm:size-1/2 md:w-1/2 lg:h-1/2 items-center justify-center relative cursor-pointer overflow-hidden group">
                  <Image
                    className="flex-1 size-full aspect-square object-cover"
                    width={800}
                    height={800}
                    src={product.secciones?.seccion_01.imagenUrl || "/default-product.png"}
                    alt="Imagen de la primera sección"
                  />
                  <span className="flex-1 inset-0 bg-[#000000a4] backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-center md:font-black text-3xl w-[300px] md:w-[280px] tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      {product.secciones?.seccion_01.title}
                    </p>
                  </span>
                </div>
              ) : null}

              {/* Segunda Sección */}
              {product.secciones?.seccion_02.imagenUrl && typeof product.secciones?.seccion_02.imagenUrl === 'string' && product.secciones?.seccion_02.imagenUrl.trim() && product.secciones?.seccion_02.title?.trim() ? (
                <div className="flex size-full sm:size-1/2 md:w-1/2 lg:h-1/2 items-center justify-center relative cursor-pointer overflow-hidden group">
                  <Image
                    className="flex-1 w-full aspect-square object-cover"
                    width={800}
                    height={800}
                    unoptimized={true}
                    src={product.secciones?.seccion_02.imagenUrl || "/default-product.png"}
                    alt="Imagen de la segunda sección"
                  />
                  <span className="flex-1 inset-0 bg-[#000000a4] backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-center md:font-black text-3xl w-[300px] md:w-[280px] tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      {product.secciones?.seccion_02.title}
                    </p>
                  </span>
                </div>
              ) : null}
            </div>

            <section className="flex flex-col gap-4 sm:flex-row md:flex-row p-3 items-center justify-center">
              {/* Ficha descriptiva */}
              {product.secciones?.ficha_descriptiva?.ficha_image && typeof product.secciones?.ficha_descriptiva?.ficha_image === 'string' && product.secciones?.ficha_descriptiva?.ficha_image.trim() ? (
                <picture className="md:size-[700px] overflow-hidden">
                  <Image
                    src={product.secciones?.ficha_descriptiva.ficha_image.trim() || "/default-product.png"}
                    width={800}
                    height={800}
                    alt="Ficha descriptiva"
                    className="hover:scale-110 transition-transform aspect-square object-cover"
                    quality={100}
                    priority
                  />
                </picture>
              ) : null}

              {product.secciones?.ficha_descriptiva ? (
                <div className="w-full md:w-[700px] md:pl-12 flex flex-col gap-y-4 md:gap-y-6 text-balance">
                  {product.secciones?.ficha_descriptiva.ficha_title && typeof product.secciones?.ficha_descriptiva.ficha_title === 'string' && product.secciones?.ficha_descriptiva.ficha_title.trim() ? (
                    <h3 className="text-3xl md:text-[38px] font-black">
                      {product.secciones?.ficha_descriptiva.ficha_title}
                    </h3>
                  ) : null}

                  {product.secciones?.ficha_descriptiva.ficha_description && typeof product.secciones?.ficha_descriptiva.ficha_description === 'string' && product.secciones?.ficha_descriptiva.ficha_description.trim() ? (
                    <p className="text-[17px] lg:w-[580px] md:text-[20px] tracking-[-0.9px] leading-7 text-[#3c3c3c]">
                      {product.secciones?.ficha_descriptiva.ficha_description}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          </section>

        </article>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetail;