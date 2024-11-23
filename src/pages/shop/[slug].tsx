import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import NavbarMenu from "@/components/navbarmenu/page";
import { Product } from "../../types/ProductTypes";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductDetailProps {
  product: Product | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string));

    const paths = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (data.slug) {
        return { params: { slug: data.slug } }; // Asegurarse de que slug exista
      }
      return null;
    }).filter(Boolean);

    return {
      paths: paths as { params: { slug: string } }[],
      fallback: true,
    };
  } catch (error) {
    console.error("Error fetching paths:", error);
    return { paths: [], fallback: true };
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

      return {
        props: {
          product: serializedData,
        },
        revalidate: 10,
      };
    } else {
      return { notFound: true };
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return { notFound: true };
  }
};

const ProductDetail = ({ product }: ProductDetailProps) => {
  if (!product) {
    return <p className="text-center">Producto no encontrado</p>;
  }

  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    const isProductInCart = cart.some((item: any) => item.id === product.id);

    if (!isProductInCart) {
      cart.push({ ...product, quantity });
      localStorage.setItem("cart", JSON.stringify(cart));
      setIsAddedToCart(true);
    } else {
      const updatedCart = cart.map((item: any) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const isProductInCart = cart.some((item: any) => item.id === product.id);
    setIsAddedToCart(isProductInCart);
  }, [product]);

  const handleQuantityChange = (operation: "increase" | "decrease") => {
    setQuantity((prev) =>
      operation === "increase" ? prev + 1 : prev > 1 ? prev - 1 : 1
    );
  };

  const imagenesArray = Object.entries(product.imagenes || {})
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, value]) => value);

  return (
    <div className="w-full mb-80">
      <NavbarMenu />

      <Head>
        <title>{product.producto || "Producto no Encontrado"}</title>
        <meta name="keywords" content={product.descripcion} />
        <meta property="og:title" content={product.producto} />
        <meta property="og:description" content={product.descripcion} />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:image" content="" />
      </Head>

      <main className="flex h-[90dvh] w-full gap-x-28 mt-3 justify-center items-center overflow-hidden">
        <Carousel>
          <CarouselContent className="size-[300px] md:size-[580px]">
            {imagenesArray?.map((img, index) => (
              <CarouselItem key={index}>
                <Image
                  quality={100}
                  priority={true}
                  src={img.img || "/default-product.png"}
                  alt={img.id || `Imagen ${index + 1}`}
                  className="size-[300px] md:size-[580px] object-contain"
                  width={300}
                  height={300}
                  // placeholder="blur"
                  // blurDataURL="/default-product.png"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="w-[40%]">
          <div className="flex flex-col gap-y-5">
            <Image
              quality={96}
              src={product.marca_producto?.logo || "/default-logo.png"}
              alt={`logo de marca ${product.marca_producto?.marca || "desconocida"}`}
              height={300}
              width={300}
              priority
              className="h-[18px] w-fit"
            />
            <h1 className="text-3xl font-semibold w-[650px] leading-8">{product.producto}</h1>

            <Separator />

            <span className="flex justify-center items-center gap-x-2 w-fit">
              <p className="bg-black w-fit h-fit text-sm px-4 py-1 text-white rounded-[4px]">SKU</p>
              <p className="text-md font-bold">{product.sku}</p>
            </span>
          </div>

          <span className="flex flex-col">
            <p className="text-[#696969]">Precio</p>
            <p className="text-2xl font-bold leading-4">{product.precio.detalle}.00</p>
          </span>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              -
            </button>
            <span className="text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex gap-x-3 mt-6 px-16 items-center justify-center py-3 text-black ${isAddedToCart ? "bg-transparent border-[1.4px] border-black text-black" : "bg-black text-white hover:bg-transparent border-black border-[1.4px] hover:text-black transition-colors"
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>

            {isAddedToCart ? "Producto en el carrito" : "Agregar al carrito"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;