import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import NavbarMenu from "@/components/navbarmenu/page";
import { Product } from "../../types/ProductTypes";
import { Separator } from "@/components/ui/separator"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Head from "next/head";
import Image from "next/image";

interface ProductDetailProps {
  product: Product | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const querySnapshot = await getDocs(
    collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string)
  );
  const paths = querySnapshot.docs.map((doc) => ({
    params: { slug: doc.data().slug },
  }));

  return {
    paths,
    fallback: true,
  };
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

      return {
        props: {
          product: serializedData,
        },
        revalidate: 60,
      };
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error);
  }

  return {
    notFound: true,
  };
};

const ProductDetail = ({ product }: ProductDetailProps) => {
  if (!product) {
    return <p className="text-center">Producto no encontrado</p>;
  }

  const imagenesArray = Object.entries(product.imagenes)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, value]) => value);

  console.log(product)

  return (
    <div className="w-full mb-80">
      <NavbarMenu />

      <Head>
        <title>{product.producto || "Prodcuto no Encontrado"}</title>
        <meta name="keywords" content={product.descripcion} />

        <meta
          property="og:title"
          content={product.producto}
        />
        <meta
          property="og:description"
          content={product.descripcion}
        />
        <meta property="og:url" content="https://tecpoint.ws" />
        <meta property="og:image" content="" />
      </Head>

      <main className="flex h-[90dvh] w-full gap-x-28 mt-6 justify-center items-center overflow-hidden">
        <Carousel>
          <CarouselContent className="size-[300px] md:size-[480px]">
            {imagenesArray?.map((img, index) => (
              <CarouselItem key={index}>
                <Image
                  quality={100}
                  priority
                  src={img.img || "/default-image.jpg"}
                  alt={img.id || `Imagen ${index + 1}`}
                  className="size-[300px] md:size-[480px] object-contain"
                  width={300}
                  height={300}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="w-[45%]">
          <div className="flex flex-col gap-y-3">
            <Image
              quality={96}
              src={product.marca_producto.logo}
              alt={`logo de marca ${product.marca_producto.marca}`}
              height={300}
              width={300}
              priority
              className="h-[40px] w-fit rounded-full"
            />
            <h1 className="text-3xl font-semibold w-[650px] leading-8">{product.producto}</h1>

            <Separator className="" />

            <span className="flex justify-center items-center gap-x-2 w-fit">
              <p className="bg-black w-fit h-fit text-sm px-4 py-1 text-white rounded-[4px]">SKU</p>
              <p className="text-md font-bold">{product.sku}</p>
            </span>
          </div>

          <span className="flex flex-col">
            <p className="text-[#696969]">Precio</p>
            <p className="text-2xl font-bold leading-4">{product.precio.detalle}.00</p>
          </span>

          {/* {product.fecha_agregado && (
            <p className="text-sm text-gray-500 mt-2">
              Fecha Agregado: {new Date(product.fecha_agregado).toLocaleDateString()}
            </p>
          )} */}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;