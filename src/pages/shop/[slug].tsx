import Head from "next/head";
import Image from "next/image";
import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";
import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import { Product, BannerInterface } from "../../types/ProductTypes";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useCartStore } from "../../lib/cartStore";
import { trackAddToCart, trackViewContent } from "@/lib/tracking";
import {
  BatteryCharging,
  Bluetooth,
  Cable,
  Camera,
  CarFront,
  CheckCircle2,
  Cpu,
  Headphones,
  Palette,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Watch,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import detailStyles from "@/styles/productDetail2026.module.css";
import {
  enrichProduct,
  isPublicProduct,
  officialCategory,
  publicCatalog,
  productSearchTerms,
  preferredProductSlug,
} from "@/lib/catalog";
import { brandLogo, canonicalBrandName } from "@/lib/brands";
import { useSiteConfig, whatsappLink } from "@/lib/siteConfig";

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

    const products = publicCatalog(
      querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[],
    );
    const paths = products.map((product) => ({
      params: { slug: preferredProductSlug(product) },
    }));

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

const FEATURE_ICONS: Array<[RegExp, LucideIcon]> = [
  [/(carga|watt|volt|bater|power|energia|usb)/i, BatteryCharging],
  [/(bluetooth|inalambr|wireless)/i, Bluetooth],
  [/(cable|conector|lightning|tipo c|type c)/i, Cable],
  [/(audio|audif|sonido|parlante|microfono)/i, Headphones],
  [/(prote|resisten|durab|garantia|seguridad)/i, ShieldCheck],
  [/(carro|vehiculo|auto)/i, CarFront],
  [/(reloj|watch|hora)/i, Watch],
  [/(color|acabado|material)/i, Palette],
  [/(tripode|selfie|fotografia|camara)/i, Camera],
  [/(compact|portatil|ligero|viaj)/i, Package],
  [/(telefono|celular|smartphone|iphone|samsung|pantalla|compatib)/i, Smartphone],
  [/(wifi|red|conexion)/i, Wifi],
  [/(chip|procesador|memoria|capacidad)/i, Cpu],
  [/(rapido|velocidad|potencia)/i, Zap],
];

function featureIcon(label: string, value: string) {
  const normalize = (text: string) =>
    text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const normalizedLabel = normalize(label);
  const text = normalize(`${label} ${value}`);
  return (
    FEATURE_ICONS.find(([pattern]) => pattern.test(normalizedLabel))?.[1] ||
    FEATURE_ICONS.find(([pattern]) => pattern.test(text))?.[1] ||
    Sparkles
  );
}

function explainSpecification(label: string) {
  const normalized = label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (normalized.includes("sku") || normalized.includes("upc")) return "Identificador útil para confirmar el producto exacto con un asesor.";
  if (normalized.includes("compat")) return "Revise también el modelo, año, tamaño y tipo de conector de su dispositivo.";
  if (normalized.includes("categoria") || normalized.includes("subcategoria")) return "Clasificación utilizada para encontrar alternativas y productos relacionados.";
  if (normalized.includes("color")) return "La disponibilidad de esta variante puede cambiar según la sucursal.";
  return "Compare este valor con las especificaciones oficiales de su dispositivo.";
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    let productDoc = querySnapshot.docs.length ? querySnapshot.docs[0] : null;

    if (!productDoc) {
      const allProducts = await getDocs(productsRef);
      productDoc = allProducts.docs.find((item) =>
        preferredProductSlug(item.data() as Product) === slug
      ) || null;
    }

    if (productDoc) {
      const doc = productDoc;
      const data = doc.data();

      const serializedData = enrichProduct({
        ...data,
        id: doc.id,
        fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
      } as Product);
      if (!isPublicProduct(serializedData)) return { notFound: true };
      const canonicalSlug = preferredProductSlug(serializedData);

      if (slug !== canonicalSlug) {
        return {
          redirect: {
            destination: `/shop/${canonicalSlug}`,
            permanent: true,
          },
        };
      }

      const productBanner = BannersData.find((banner) => banner.marca === data.marca_producto?.marca);

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
  const { mainWhatsApp } = useSiteConfig();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showRemaining, setShowRemaining] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<"features" | "description" | "specs">("features");
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
      trackAddToCart({
        id: product.sku || product.id,
        name: product.producto,
        price: Number(product.precio.detalle),
        quantity,
      });
    }
  };

  useEffect(() => {
    if (product) {
      trackViewContent({
        id: product.sku || product.id,
        name: product.producto,
        price: Number(product.precio.detalle),
      });
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
          <p className="text-center">Producto no encontrado</p>
        </div>
        <Footer />
      </div>
    );
  }

  const imagenesArray = Object.entries(product.imagenes || {}).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).map(([, value]) => value);
  const primaryImage = imagenesArray[0]?.img || "https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338";
  const canAddToCart =
    product.extradata?.stock === true && Number(product.precio?.detalle) > 0;
  const specificationEntries = Object.entries(
    product.extradata?.especificaciones || {},
  )
    .map(([label, value]) => ({
      label: String(label).trim(),
      value: String(value || "").trim(),
    }))
    .filter((item) => item.label && item.value);
  const technicalEntries = [
    ...specificationEntries,
    { label: "SKU", value: product.sku || "" },
    { label: "UPC", value: product.extradata?.upc || "" },
    { label: "Categoría", value: product.categorias?.[0] || "" },
    { label: "Subcategoría", value: product.Subcategorias || "" },
    { label: "Color", value: product.extradata?.color || "" },
  ]
    .filter((item) => item.value)
    .filter(
      (item, index, list) =>
        list.findIndex(
          (candidate) =>
            candidate.label.toLowerCase() === item.label.toLowerCase(),
        ) === index,
    );
  const explicitCompatibility = specificationEntries.find((entry) =>
    entry.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("compat"),
  )?.value;
  const compatibleWith = explicitCompatibility || product.Subcategorias || "Compatibilidad no especificada en el catálogo";
  const category = officialCategory(product);
  const solutionByCategory: Record<string, { title: string; problem: string; benefit: string }> = {
    "Power & Charge": { title: "Energía cuando la necesita", problem: "Ayuda a evitar interrupciones por batería baja o una carga poco práctica.", benefit: "Úselo como una solución de energía acorde con la potencia, el conector y el ritmo de uso de su dispositivo." },
    "Screen Protection": { title: "Menos preocupación por la pantalla", problem: "Ayuda a reducir el impacto del roce y del uso cotidiano sobre la superficie más expuesta.", benefit: "Confirme el modelo y el tamaño exactos para lograr el ajuste y la cobertura adecuados." },
    "Sound Essentials": { title: "Audio más cómodo en su rutina", problem: "Facilita escuchar, conversar o disfrutar contenido sin depender del altavoz del dispositivo.", benefit: "Revise conexión, autonomía y formato para elegir la experiencia que realmente necesita." },
    "Smart Drive": { title: "Una experiencia más ordenada al conducir", problem: "Ayuda a mantener la energía, el acceso o la organización del dispositivo dentro del vehículo.", benefit: "Compruebe el tipo de instalación y la compatibilidad con su vehículo antes de comprar." },
    "Travel & Carry": { title: "Tecnología organizada y protegida", problem: "Ayuda a transportar accesorios sin perder tiempo buscando cables, cargadores o dispositivos.", benefit: "Compare capacidad y dimensiones con lo que lleva habitualmente." },
    "Outdoor Pro": { title: "Preparado para acompañar su ritmo", problem: "Ofrece una alternativa práctica para actividades fuera de casa y usos más exigentes.", benefit: "Revise los materiales y las certificaciones indicadas; no asuma resistencia que no figure en la ficha." },
    "Smart Tech": { title: "Una función útil, sin complicaciones", problem: "Resuelve una necesidad concreta y amplía lo que puede hacer con sus dispositivos.", benefit: "Compare la función principal y los requisitos de conexión antes de elegir." },
  };
  const categorySolution = solutionByCategory[category] || solutionByCategory["Smart Tech"];
  const purchaseReasons = [
    categorySolution,
    {
      title: "Compatibilidad con mayor seguridad",
      problem: `La referencia registrada corresponde a: ${compatibleWith}.`,
      benefit: "Evita comprar solo por apariencia. Si su modelo, generación o conector no aparece, consulte con un asesor antes de pagar.",
    },
    {
      title: "Una elección que puede verificar",
      problem: `TECPOINT identifica esta unidad como ${product.sku}${product.extradata?.upc ? ` y UPC ${product.extradata.upc}` : ""}.`,
      benefit: "Estos datos permiten confirmar el artículo exacto, consultar disponibilidad y recibir orientación más rápida.",
    },
  ];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.producto || "",
    sku: product.sku || "",
    mpn: product.sku || "",
    ...(product.extradata?.upc
      ? { gtin: String(product.extradata.upc) }
      : {}),
    image: primaryImage || "",
    description: product.descripcion || "",
    keywords: productSearchTerms(product).join(", "),
    category: product.categorias?.[0] || "",
    color: product.extradata?.color || undefined,
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

  const banner =
    Banners.find(
      (item) =>
        canonicalBrandName(item.marca) ===
        canonicalBrandName(product.marca_producto?.marca),
    ) || {
      color: "000000",
      ImageBanner:
        brandLogo(product.marca_producto?.marca) || "/default-product.png",
    };

  return (
    <>
      <Head>
        <title>{`${product.producto || "Producto"} | TECPOINT Honduras`}</title>
        <meta
          name="description"
          content={`${product.producto}. ${product.descripcion || "Accesorio tecnológico disponible en TECPOINT Honduras."} SKU ${product.sku}.`.slice(0, 158)}
        />
        <meta name="keywords" content={productSearchTerms(product).join(", ")} />

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

      <NavbarMenu />

      <main>
        <section className="flex flex-col lg:flex-row h-fit w-full gap-x-28 justify-center items-center overflow-hidden">
          <div className="flex flex-col gap-y-3 p-2 sm:pt-4">

            <Carousel className="border rounded-xl flex-1 sm:size-[480px] md:size-[500px]" opts={{ loop: true }}>
              <CarouselContent className="">
                {imagenesArray.length > 0 ?
                  imagenesArray.map((img: { img: string }, index: number) => (
                    <CarouselItem key={index}>
                      <Image
                        rel="noopener noreferrer"
                        quality={82}
                        priority={index === 0}
                        src={img.img || "/default-product.png"}
                        alt={product.producto || `Imagen ${index + 1}`}
                        className="flex-1 sm:size-[480px] md:size-[500px] aspect-square object-contain rounded-xl"
                        width={1100}
                        height={1100}
                        sizes="(max-width: 640px) 100vw, 500px"
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
                  quality={65}
                  src={img.img || "/default-product.png"}
                  alt={product.producto || `Imagen ${index + 1}`}
                  className="size-[110px] md:size-[110px] aspect-square object-contain border cursor-pointer rounded-lg"
                  width={110}
                  height={110}
                  sizes="110px"
                />
              ))}

              {/* Cuadro adicional para alternar entre las primeras y las restantes imágenes */}
              {imagenesArray.length > 3 && !showRemaining && (
                <button
                  type="button"
                  aria-label={`Mostrar ${imagenesArray.length - 3} imágenes adicionales`}
                  className="size-[110px] md:size-[110px] rounded-lg aspect-square flex items-center justify-center border bg-gray-200 cursor-pointer"
                  onClick={handleToggleImages}
                >
                  <span className="text-sm font-medium text-gray-600">
                    +{imagenesArray.length - 3}
                  </span>
                </button>
              )}

              {/* Botón para volver a las primeras imágenes */}
              {showRemaining && (
                <button
                  type="button"
                  className="size-[110px] md:size-[110px] rounded-lg aspect-square flex items-center justify-center border bg-gray-200 cursor-pointer"
                  onClick={handleToggleImages}
                >
                  <span className="text-sm font-medium text-gray-600">Ver menos</span>
                </button>
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
              <h1 className="text-[26px] font-semibold max-w-full md:w-[450px] lg:w-[560px] leading-8 2xl:text-4xl break-words [overflow-wrap:anywhere]">
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
                disabled={!canAddToCart}
                className={`flex gap-x-3 px-6 items-center justify-center py-3 rounded-[6px] w-full border-[1.4px] transition-colors ${
                  canAddToCart
                    ? "bg-black text-white hover:bg-white border-black hover:text-black"
                    : "bg-[#e4e7e8] text-[#657074] border-[#d1d6d8] cursor-not-allowed"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>

                {!canAddToCart
                  ? product.extradata?.stock
                    ? "Consultar precio por WhatsApp"
                    : "Producto agotado"
                  : isAddedToCart
                    ? "Agregar otra vez"
                    : "Agregar al carrito"}
              </button>

              <button
                onClick={() => {
                  const message = `https://tecpoint.ws/shop/${product.slug}\n\nHola Tecpoint, quiero ordenar un: \n \n${product.producto}\nSKU : ${product.sku}\ncantidad : ${quantity}`;
                  const whatsappUrl = whatsappLink(mainWhatsApp, message);
                  window.open(whatsappUrl, "_blank");
                }}
                className={`flex gap-x-3 mt-1 px-16 items-center justify-center py-3 rounded-[6px] w-full 
              bg-[#25d366] text-white hover:bg-[#2cc564af] transition-colors
              `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.693 56.693" width="26" height="26" fill="currentColor">
                  <g>
                    <path fillRule="evenodd" clipRule="evenodd" d="M46.3802,10.7138c-4.6512-4.6565-10.8365-7.222-17.4266-7.2247c-13.5785,0-24.63,11.0506-24.6353,24.6333c-0.0019,4.342,1.1325,8.58,3.2884,12.3159l-3.495,12.7657l13.0595-3.4257c3.5982,1.9626,7.6495,2.9971,11.7726,2.9985h0.01c0.0008,0-0.0006,0,0.0002,0c13.5771,0,24.6293-11.0517,24.635-24.6347C53.5914,21.5595,51.0313,15.3701,46.3802,10.7138z M28.9537,48.6163h-0.0083c-3.674-0.0014-7.2777-0.9886-10.4215-2.8541l-0.7476-0.4437l-7.7497,2.0328l2.0686-7.5558l-0.4869-0.7748c-2.0496-3.26-3.1325-7.028-3.1305-10.8969c0.0044-11.2894,9.19-20.474,20.4842-20.474c5.469,0.0017,10.6101,2.1344,14.476,6.0047c3.8658,3.8703,5.9936,9.0148,5.9914,14.4859C49.4248,39.4307,40.2395,48.6163,28.9537,48.6163z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M40.1851,33.281c-0.6155-0.3081-3.6419-1.797-4.2061-2.0026c-0.5642-0.2054-0.9746-0.3081-1.3849,0.3081c-0.4103,0.6161-1.59,2.0027-1.9491,2.4136c-0.359,0.4106-0.7182,0.4623-1.3336,0.1539c-0.6155-0.3081-2.5989-0.958-4.95-3.0551c-1.83-1.6323-3.0653-3.6479-3.4245-4.2643c-0.359-0.6161-0.0382-0.9492,0.27-1.2562c0.2769-0.2759,0.6156-0.7189,0.9234-1.0784c0.3077-0.3593,0.4103-0.6163,0.6155-1.0268c0.2052-0.4109,0.1027-0.7704-0.0513-1.0784c-0.1539-0.3081-1.3849-3.3379-1.8978-4.5706c-0.4998-1.2001-1.0072-1.0375-1.3851-1.0566c-0.3585-0.0179-0.7694-0.0216-1.1797-0.0216s-1.0773,0.1541-1.6414,0.7702c-0.5642,0.6163-2.1545,2.1056-2.1545,5.1351c0,3.0299,2.2057,5.9569,2.5135,6.3676c0.3077,0.411,4.3405,6.6282,10.5153,9.2945c1.4686,0.6343,2.6152,1.013,3.5091,1.2966c1.4746,0.4686,2.8165,0.4024,3.8771,0.2439c1.1827-0.1767,3.6419-1.489,4.1548-2.9267c0.513-1.438,0.513-2.6706,0.359-2.9272C41.211,33.7433,40.8006,33.5892,40.1851,33.281z" />
                  </g>
                </svg>
                Ordenar Ahora
              </button>
            </div>

            <div className="mt-3">
              {Number(product.precio.detalle) > 1200 ?
                (
                  <span className={detailStyles.shippingStatus}>
                    <span className={detailStyles.truckDrive}><Image unoptimized={true} height={30} width={30} src="/icons/truck.svg" alt="" /></span>
                    <span>
                      <p className="font-bold">Envío gratis</p>
                      <p className="leading-3">Este producto califica para envío gratis.</p>
                    </span>
                  </span>
                )
                : (
                  <span className={detailStyles.shippingStatus}>
                    <span className={detailStyles.truckProgress}><Image unoptimized={true} height={28} width={28} src="/icons/truck.svg" alt="" /></span>
                    <p>Le faltan L {1200 - Number(product.precio.detalle)} para obtener envío gratis.</p>
                  </span>
                )
              }
            </div>
          </div>
        </section>

        <section className={detailStyles.motionBanner}>
          <div className={detailStyles.motionGrid} aria-hidden="true" />
          <div className={detailStyles.motionOrbit} aria-hidden="true">
            <Image src="/brand/isologo.svg" alt="" width={190} height={190} />
          </div>
          <Image
            className={detailStyles.brandWatermark}
            src={banner.ImageBanner || product.marca_producto?.logo || "/brand/isologo.svg"}
            alt=""
            width={760}
            height={280}
            unoptimized
          />
          <div className={detailStyles.motionCopy}>
            <p>{product.marca_producto?.marca} · SELECCIÓN TECPOINT</p>
            <h2>{product.producto}</h2>
            <span>Diseñado para conectar con su día.</span>
          </div>
          <div className={detailStyles.motionRail} aria-hidden="true">
            <span>TECNOLOGÍA QUE SE SIENTE</span>
            <span>CALIDAD</span>
            <span>COMPATIBILIDAD</span>
            <span>EXPERIENCIA</span>
          </div>
        </section>

        <article className={detailStyles.productStory}>
          <nav className={detailStyles.infoTabs} role="tablist" aria-label="Información del producto">
            <button
              type="button"
              role="tab"
              aria-selected={activeInfoTab === "features"}
              aria-controls="product-features"
              className={activeInfoTab === "features" ? detailStyles.activeTab : ""}
              onClick={() => setActiveInfoTab("features")}
            >
              <span>01</span> Tres razones para elegirlo
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeInfoTab === "description"}
              aria-controls="product-description"
              className={activeInfoTab === "description" ? detailStyles.activeTab : ""}
              onClick={() => setActiveInfoTab("description")}
            >
              <span>02</span> Conozca el producto
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeInfoTab === "specs"}
              aria-controls="product-specs"
              className={activeInfoTab === "specs" ? detailStyles.activeTab : ""}
              onClick={() => setActiveInfoTab("specs")}
            >
              <span>03</span> Ficha técnica
            </button>
          </nav>

          {activeInfoTab === "features" && <section id="product-features" role="tabpanel" className={detailStyles.features} aria-labelledby="feature-title">
            <div className={detailStyles.sectionIntro}>
              <p>LO ESENCIAL</p>
              <div><h2 id="feature-title">Tres razones para elegirlo.</h2><span>Entienda qué aporta cada característica y por qué puede ser útil en su día a día.</span></div>
            </div>
            <div className={detailStyles.featureGrid}>
              {purchaseReasons.map((reason, index) => {
                const Icon = featureIcon(reason.title, `${reason.problem} ${reason.benefit}`);
                return (
                  <div className={detailStyles.featureCard} key={`${reason.title}-${index}`}>
                    <span>
                      <Icon aria-hidden="true" strokeWidth={1.8} />
                    </span>
                    <small>0{index + 1}</small>
                    <h3>{reason.title}</h3>
                    <p>{reason.problem}</p>
                    <p className={detailStyles.featureBenefit}>{reason.benefit}</p>
                  </div>
                );
              })}
            </div>
          </section>}

          {activeInfoTab === "description" && <section id="product-description" role="tabpanel" className={detailStyles.singlePanel} aria-labelledby="description-title">
            <div className={detailStyles.description}>
              <p>DESCRIPCIÓN</p>
              <h2 id="description-title">Conozca el producto.</h2>
              <div className={detailStyles.descriptionRule} />
              <p>{product.descripcion}</p>
              <p className={detailStyles.descriptionSupport}>Antes de comprar, compare el tipo de conexión, las dimensiones y el modelo exacto de su dispositivo. Una coincidencia visual no garantiza compatibilidad.</p>
              <div className={detailStyles.verified}>
                <CheckCircle2 aria-hidden="true" />
                Información verificada con el catálogo TECPOINT.
              </div>
            </div>
          </section>}

          {activeInfoTab === "specs" && <section id="product-specs" role="tabpanel" className={detailStyles.singlePanel} aria-labelledby="technical-title">
            <div className={detailStyles.specificationPanel}>
              <p>DATOS DEL PRODUCTO</p>
              <h2 id="technical-title">Ficha técnica.</h2>
              <p className={detailStyles.specificationLead}>Información para comparar el producto con su equipo y elegir con mayor seguridad.</p>
              <dl>
                {technicalEntries.map((entry) => (
                  <div key={entry.label}>
                    <dt>{entry.label}</dt>
                    <dd><strong>{entry.value}</strong><small>{explainSpecification(entry.label)}</small></dd>
                  </div>
                ))}
              </dl>
              <div className={detailStyles.compatibilityGuide}>
                <div><span>Compatible con</span><strong>{compatibleWith}</strong></div>
                <div><span>No asuma compatibilidad con</span><strong>Modelos, tamaños, generaciones o conectores que no aparezcan expresamente en esta ficha.</strong></div>
                <a href={whatsappLink(mainWhatsApp, `Hola TECPOINT, necesito confirmar la compatibilidad de ${product.producto} (SKU ${product.sku}) con mi dispositivo.`)} target="_blank" rel="noreferrer">¿No está seguro? Hablar con un asesor →</a>
              </div>
            </div>
          </section>}

          <section
            className={`bg-[#ECECEC] flex flex-col md:gap-y-12 md:mt-10 ${(!product.secciones?.seccion_01?.imagenUrl || typeof product.secciones?.seccion_01?.imagenUrl !== 'string' || !product.secciones?.seccion_01?.imagenUrl.trim()) &&
              (!product.secciones?.seccion_02?.imagenUrl || typeof product.secciones?.seccion_02?.imagenUrl !== 'string' || !product.secciones?.seccion_02?.imagenUrl.trim()) &&
              (!product.secciones?.ficha_descriptiva?.ficha_image || typeof product.secciones?.ficha_descriptiva?.ficha_image !== 'string' || !product.secciones?.ficha_descriptiva?.ficha_image.trim()) ? 'hidden' : ''}`}
          >
            <div className="flex flex-col sm:flex-row gap-2 p-3 justify-center m-auto w-full max-w-[1600px]">
              {/* Primera Sección */}
              {product.secciones?.seccion_01?.imagenUrl && typeof product.secciones?.seccion_01?.imagenUrl === 'string' && product.secciones?.seccion_01?.imagenUrl.trim() && product.secciones?.seccion_01?.title?.trim() ? (
                <div className="flex size-full sm:size-1/2 md:w-1/2 lg:h-1/2 items-center justify-center relative cursor-pointer overflow-hidden group">
                  <Image
                    className="flex-1 size-full aspect-square object-cover"
                    width={800}
                    height={800}
                    src={product.secciones?.seccion_01?.imagenUrl || "/default-product.png"}
                    alt="Imagen de la primera sección"
                  />
                  <span className="flex-1 inset-0 bg-[#000000a4] backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-center md:font-black text-3xl w-[300px] md:w-[280px] tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      {product.secciones?.seccion_01?.title}
                    </p>
                  </span>
                </div>
              ) : null}

              {/* Segunda Sección */}
              {product.secciones?.seccion_02?.imagenUrl && typeof product.secciones?.seccion_02?.imagenUrl === 'string' && product.secciones?.seccion_02?.imagenUrl.trim() && product.secciones?.seccion_02?.title?.trim() ? (
                <div className="flex size-full sm:size-1/2 md:w-1/2 lg:h-1/2 items-center justify-center relative cursor-pointer overflow-hidden group">
                  <Image
                    className="flex-1 w-full aspect-square object-cover"
                    width={800}
                    height={800}
                    src={product.secciones?.seccion_02?.imagenUrl || "/default-product.png"}
                    alt="Imagen de la segunda sección"
                  />
                  <span className="flex-1 inset-0 bg-[#000000a4] backdrop-blur-sm absolute grid place-content-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-center md:font-black text-3xl w-[300px] md:w-[280px] tracking-[-0.17px] text-white transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      {product.secciones?.seccion_02?.title}
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
                    quality={82}
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
