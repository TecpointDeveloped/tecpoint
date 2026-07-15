import Head from "next/head";
import Image from "next/image";
import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";
import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import { Product, BannerInterface } from "../../types/ProductTypes";
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

import BannersData from "@/data/banners.json";

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

      const productBrand = typeof data.marca_producto?.marca === "string"
        ? data.marca_producto.marca.trim().toLowerCase()
        : "";

      const productBanner = BannersData.find((banner) =>
        typeof banner.marca === "string" &&
        banner.marca.trim().toLowerCase() === productBrand
      );

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
          <p className="text-center text-gray-500">Producto no encontrado</p>
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

  const productBrand = typeof product.marca_producto?.marca === "string"
    ? product.marca_producto.marca.trim().toLowerCase()
    : "";

  const banner = Banners.find((banner) =>
    typeof banner.marca === "string" &&
    banner.marca.trim().toLowerCase() === productBrand
  ) || {
    color: "000000",
    ImageBanner: "/default-banner.png",
  };

  const inStock = product.extradata?.stock === true;
  const hasFreeShipping = Number(product.precio.detalle) > 1500;
  const remainingForFreeShipping = 1500 - Number(product.precio.detalle);

  return (
    <>
      <Head>
        <title>{`${product.producto} | Compra en Tecpoint - Distribuidor #1 en Honduras`}</title>
        <meta
          name="description"
          content={`${product.producto} en Tecpoint. ${product.descripcion?.slice(0, 100)} Entrega 24-48h, pago al recibir. ¡Compra ahora!`}
        />
        <meta
          name="keywords"
          content={`${product.producto}, ${product.marca_producto?.marca || ""}, Tecpoint Honduras, comprar online, distribuidor, envío a todo país`}
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="es-HN" />
        <meta name="author" content="Tecpoint Distribucion" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.producto} | Tecpoint Honduras`} />
        <meta
          property="og:description"
          content={`${product.descripcion?.slice(0, 120) || "Producto disponible en Tecpoint"} Envío gratis en compras mayores a Lps. 1,500.`}
        />
        <meta property="og:url" content={`https://tecpoint.ws/shop/${product.slug}`} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.producto} | Tecpoint`} />
        <meta
          name="twitter:description"
          content={`Compra ${product.producto} en Tecpoint. Entrega 24-48h a todo Honduras. Pago al recibir.`}
        />
        <meta name="twitter:image" content={primaryImage} />
        <meta name="twitter:image:alt" content={product.producto || "Producto Tecpoint"} />
        <meta name="twitter:creator" content="@tecpointhn" />
        <link rel="canonical" href={`https://tecpoint.ws/shop/${product.slug}`} />
        <meta name="geo.region" content="HN" />
        <meta name="geo.placename" content="Honduras" />
      </Head>

      <NavbarMenu />

      <main className="max-w-[1400px] mx-auto px-4 py-8">

        {/* ── Sección principal: imagen + info ── */}
        <section className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Panel de imágenes */}
          <div className="flex flex-col gap-3 lg:w-[520px] shrink-0">
            <Carousel className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100" opts={{ loop: true }}>
              <CarouselContent>
                {imagenesArray.length > 0
                  ? imagenesArray.map((img: { img: string }, index: number) => (
                    <CarouselItem key={index}>
                      <Image
                        quality={100}
                        priority={index === 0}
                        src={img.img || "/default-product.png"}
                        alt={product.producto || `Imagen ${index + 1}`}
                        className="w-full aspect-square object-contain p-6"
                        width={1100}
                        height={1100}
                      />
                    </CarouselItem>
                  ))
                  : <Image width={1100} height={1100} src="/default-product.png" className="w-full aspect-square object-contain p-6" alt="Default product image" />
                }
              </CarouselContent>
              <CarouselPrevious className="left-3" />
              <CarouselNext className="right-3" />
            </Carousel>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imagesToShow.map((img, index) => (
                <div key={index} className="shrink-0 size-[80px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden hover:border-black transition-colors cursor-pointer">
                  <Image
                    quality={80}
                    priority={true}
                    src={img.img || "/default-product.png"}
                    alt={product.producto || `Imagen ${index + 1}`}
                    className="size-full object-contain p-1"
                    width={110}
                    height={110}
                  />
                </div>
              ))}

              {imagenesArray.length > 3 && !showRemaining && (
                <div
                  className="shrink-0 size-[80px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-black transition-colors"
                  onClick={handleToggleImages}
                >
                  <span className="text-sm font-semibold text-gray-500">+{imagenesArray.length - 3}</span>
                </div>
              )}

              {showRemaining && (
                <div
                  className="shrink-0 size-[80px] rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-black transition-colors"
                  onClick={handleToggleImages}
                >
                  <span className="text-xs font-semibold text-gray-500 text-center leading-tight px-1">Ver menos</span>
                </div>
              )}
            </div>
          </div>

          {/* Panel de información */}
          <div className="flex flex-col gap-6 flex-1 lg:pt-2">

            {/* Marca + nombre */}
            <div className="flex flex-col gap-3">
              <Image
                quality={96}
                src={banner.ImageBanner || "/default-logo.png"}
                alt={`Logo de marca ${product.marca_producto?.marca || "desconocida"}`}
                height={24}
                width={120}
                priority
                unoptimized={true}
                className="h-[24px] w-auto object-contain object-left"
              />
              <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-gray-900">
                {product.producto}
              </h1>
            </div>

            {/* SKU + Stock */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</span>
                <span className="text-sm font-semibold text-gray-800">{product.sku}</span>
              </span>

              {inStock ? (
                <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                  <span className="size-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-sm font-semibold text-green-700">En stock</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                  <span className="size-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm font-semibold text-red-700">Agotado</span>
                </span>
              )}
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-0.5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Precio detalle</p>
              <p className="text-4xl font-black text-gray-900 tracking-tight">
                <span className="text-xl font-semibold text-gray-400 mr-1">Lps.</span>
                {Number(product.precio.detalle).toLocaleString()}.00
              </p>
            </div>

            <div className="w-full h-px bg-gray-100" />

            {/* Cantidad */}
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-gray-600">Cantidad</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange("decrease")}
                  className="size-10 rounded-full border border-gray-200 text-xl font-light hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-lg font-bold w-8 text-center tabular-nums">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange("increase")}
                  disabled={added}
                  className={`size-10 rounded-full border text-xl font-light flex items-center justify-center transition-colors ${added ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 hover:bg-gray-100"}`}
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-[#FF3B01] py-2.5 px-4 rounded-xl w-max text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <Image
                  quality={96}
                  src="/logos/forzaDelivery.png"
                  alt="Envio mendiante Forza Delivery"
                  width={80}
                  height={32}
                  className="h-[32px] w-auto"
                />
              </div>
              <div className="flex flex-col gap-1 text-xs font-semibold">
                <p className="flex items-center gap-1.5">
                  <span>✓</span>
                  Pago al recibir
                </p>
                <p className="flex items-center gap-1.5">
                  <span>✓</span>
                  24 a 48 horas (días hábiles)
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 w-full max-w-[480px]">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {isAddedToCart ? "Agregar otra vez" : "Agregar al carrito"}
              </button>

              <button
                onClick={() => {
                  const message = `https://tecpoint.ws/shop/${product.slug}\n\nHola Tecpoint, quiero ordenar un: \n \n${product.producto}\nSKU : ${product.sku}\ncantidad : ${quantity}`;
                  const whatsappUrl = `https://wa.me/50497157784?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, "_blank");
                }}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 rounded-full bg-[#25d366] text-white font-semibold hover:bg-[#1fba58] active:scale-[0.98] transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.693 56.693" width="20" height="20" fill="currentColor">
                  <g>
                    <path fillRule="evenodd" clipRule="evenodd" d="M46.3802,10.7138c-4.6512-4.6565-10.8365-7.222-17.4266-7.2247c-13.5785,0-24.63,11.0506-24.6353,24.6333c-0.0019,4.342,1.1325,8.58,3.2884,12.3159l-3.495,12.7657l13.0595-3.4257c3.5982,1.9626,7.6495,2.9971,11.7726,2.9985h0.01c0.0008,0-0.0006,0,0.0002,0c13.5771,0,24.6293-11.0517,24.635-24.6347C53.5914,21.5595,51.0313,15.3701,46.3802,10.7138z M28.9537,48.6163h-0.0083c-3.674-0.0014-7.2777-0.9886-10.4215-2.8541l-0.7476-0.4437l-7.7497,2.0328l2.0686-7.5558l-0.4869-0.7748c-2.0496-3.26-3.1321-7.028-3.1305-10.8969c0.0044-11.2894,9.19-20.474,20.4842-20.474c5.469,0.0017,10.6101,2.1344,14.476,6.0047c3.8658,3.8703,5.9936,9.0148,5.9914,14.4859C49.4248,39.4307,40.2395,48.6163,28.9537,48.6163z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M40.1851,33.281c-0.6155-0.3081-3.6419-1.797-4.2061-2.0026c-0.5642-0.2054-0.9746-0.3081-1.3849,0.3081c-0.4103,0.6161-1.59,2.0027-1.9491,2.4136c-0.359,0.4106-0.7182,0.4623-1.3336,0.1539c-0.6155-0.3081-2.5989-0.958-4.95-3.0551c-1.83-1.6323-3.0653-3.6479-3.4245-4.2643c-0.359-0.6161-0.0382-0.9492,0.27-1.2562c0.2769-0.2759,0.6156-0.7189,0.9234-1.0784c0.3077-0.3593,0.4103-0.6163,0.6155-1.0268c0.2052-0.4109,0.1027-0.7704-0.0513-1.0784c-0.1539-0.3081-1.3849-3.3379-1.8978-4.5706c-0.4998-1.2001-1.0072-1.0375-1.3851-1.0566c-0.3585-0.0179-0.7694-0.0216-1.1797-0.0216s-1.0773,0.1541-1.6414,0.7702c-0.5642,0.6163-2.1545,2.1056-2.1545,5.1351c0,3.0299,2.2057,5.9569,2.5135,6.3676c0.3077,0.411,4.3405,6.6282,10.5153,9.2945c1.4686,0.6343,2.6152,1.013,3.5091,1.2966c1.4746,0.4686,2.8165,0.4024,3.8771,0.2439c1.1827-0.1767,3.6419-1.489,4.1548-2.9267c0.513-1.438,0.513-2.6706,0.359-2.9272C41.211,33.7433,40.8006,33.5892,40.1851,33.281z" />
                  </g>
                </svg>
                Ordenar por WhatsApp
              </button>
            </div>

            {/* Envío */}
            {hasFreeShipping ? (
              <div className="flex items-center gap-3 border border-green-200 bg-green-50 rounded-2xl px-4 py-3 w-full max-w-[480px]">
                <div className="size-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Image unoptimized={true} height={20} width={20} src="/icons/truck.svg" alt="envio gratis" />
                </div>
                <div>
                  <p className="font-bold text-sm text-green-800">Envío gratis incluido</p>
                  <p className="text-xs text-green-600">Envío a todo el país sin costo adicional</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 w-full max-w-[480px]">
                <div className="size-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Image unoptimized={true} height={20} width={20} src="/icons/info.svg" alt="info envio" />
                </div>
                <p className="text-sm text-gray-600">
                  Agrega <span className="font-bold text-gray-900">Lps. {remainingForFreeShipping}</span> más para obtener envío gratis
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Banner de marca ── */}
        <section
          style={{ backgroundColor: `#${banner.color}` }}
          className="overflow-hidden rounded-2xl w-full h-28 md:h-40 grid place-content-center relative mt-14"
        >
          <h2 className="md:text-2xl font-bold text-lg text-center text-white tracking-tight z-[1] relative px-6 max-w-[560px]">
            {product.producto}
          </h2>
          <span className="w-full h-full flex items-center justify-center absolute inset-0">
            <Image
              className="h-full w-auto opacity-20 select-none"
              src={banner.ImageBanner || ""}
              alt="Banner del producto"
              width={700}
              height={700}
              unoptimized={true}
            />
          </span>
        </section>

        {/* ── Especificaciones ── */}
        <article className="mt-14">
          {Object.keys(product.extradata?.especificaciones || {}).length > 0 && (
            <>
              <div className="mb-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Detalles</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Especificaciones</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 max-w-[1100px] mx-auto w-full mb-8">
                {Object.entries(product.extradata?.especificaciones || {}).map(([key, value]) => (
                  <Accordion type="single" collapsible key={key} className="w-full">
                    <AccordionItem value={key} className="border-b border-gray-100">
                      <AccordionTrigger className="font-semibold text-[17px] py-4 hover:no-underline">
                        {key}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-500 text-[15px] leading-relaxed pb-2">{value}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </>
          )}

          {/* ── Secciones de imagen ── */}
          <section
            className={`bg-gray-50 rounded-2xl overflow-hidden flex flex-col gap-2 mt-4 ${(!product.secciones?.seccion_01.imagenUrl || typeof product.secciones?.seccion_01.imagenUrl !== 'string' || !product.secciones?.seccion_01.imagenUrl.trim()) &&
              (!product.secciones?.seccion_02.imagenUrl || typeof product.secciones?.seccion_02.imagenUrl !== 'string' || !product.secciones?.seccion_02.imagenUrl.trim()) &&
              (!product.secciones?.ficha_descriptiva?.ficha_image || typeof product.secciones?.ficha_descriptiva?.ficha_image !== 'string' || !product.secciones?.ficha_descriptiva?.ficha_image.trim())
              ? 'hidden' : ''
              }`}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              {product.secciones?.seccion_01.imagenUrl && typeof product.secciones?.seccion_01.imagenUrl === 'string' && product.secciones?.seccion_01.imagenUrl.trim() && product.secciones?.seccion_01.title?.trim() ? (
                <div className="flex-1 relative cursor-pointer overflow-hidden group aspect-square">
                  <Image
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    src={product.secciones.seccion_01.imagenUrl}
                    alt="Imagen de la primera sección"
                  />
                  <span className="absolute inset-0 bg-black/60 backdrop-blur-sm grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-center font-black text-2xl md:text-3xl w-[260px] tracking-tight text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {product.secciones.seccion_01.title}
                    </p>
                  </span>
                </div>
              ) : null}

              {product.secciones?.seccion_02.imagenUrl && typeof product.secciones?.seccion_02.imagenUrl === 'string' && product.secciones?.seccion_02.imagenUrl.trim() && product.secciones?.seccion_02.title?.trim() ? (
                <div className="flex-1 relative cursor-pointer overflow-hidden group aspect-square">
                  <Image
                    className="w-full h-full object-cover"
                    width={800}
                    height={800}
                    unoptimized={true}
                    src={product.secciones.seccion_02.imagenUrl}
                    alt="Imagen de la segunda sección"
                  />
                  <span className="absolute inset-0 bg-black/60 backdrop-blur-sm grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-center font-black text-2xl md:text-3xl w-[260px] tracking-tight text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {product.secciones.seccion_02.title}
                    </p>
                  </span>
                </div>
              ) : null}
            </div>

            {product.secciones?.ficha_descriptiva?.ficha_image && typeof product.secciones?.ficha_descriptiva?.ficha_image === 'string' && product.secciones?.ficha_descriptiva?.ficha_image.trim() ? (
              <section className="flex flex-col md:flex-row gap-6 p-6 md:p-10 items-center">
                <div className="md:w-[480px] shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={product.secciones.ficha_descriptiva.ficha_image.trim()}
                    width={800}
                    height={800}
                    alt="Ficha descriptiva"
                    className="hover:scale-105 transition-transform duration-500 w-full aspect-square object-cover"
                    quality={100}
                    priority
                  />
                </div>

                <div className="flex flex-col gap-4 flex-1">
                  {product.secciones.ficha_descriptiva.ficha_title && typeof product.secciones.ficha_descriptiva.ficha_title === 'string' && product.secciones.ficha_descriptiva.ficha_title.trim() ? (
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                      {product.secciones.ficha_descriptiva.ficha_title}
                    </h3>
                  ) : null}
                  {product.secciones.ficha_descriptiva.ficha_description && typeof product.secciones.ficha_descriptiva.ficha_description === 'string' && product.secciones.ficha_descriptiva.ficha_description.trim() ? (
                    <p className="text-base md:text-lg text-gray-500 leading-relaxed">
                      {product.secciones.ficha_descriptiva.ficha_description}
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetail;
