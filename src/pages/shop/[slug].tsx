import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import NavbarMenu from "@/components/navbarmenu/page";
import { Product } from "../../types/ProductTypes";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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

  // Convertir las imágenes a un array y ordenarlas por clave
  const imagenesArray = Object.entries(product.imagenes)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Ordenar por la clave (imagen_01, imagen_02, ...)
    .map(([, value]) => value);

  return (
    <div className="w-full">
      <NavbarMenu />

      <main className="flex h-[90dvh] w-full p-5 gap-x-24 items-center justify-center">
        {/* Galería de imágenes */}
        <Carousel className="size-[500px]">
          <CarouselContent>
            {imagenesArray.map((imagen, index) => (
              <CarouselItem key={index}>
                <img
                  key={index}
                  src={imagen.img || "/default-product.png"}
                  alt={`${product.producto} - Imagen ${index + 1}`}
                  className="h-[500px] w-[500px] aspect-[500/500] mb-4"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Detalles del producto */}
        <div className="w-[40%]">
          <h1 className="text-3xl font-bold mb-4 w-[650px]">{product.producto}</h1>

          <p className="text-xl font-bold">Precio Detalle: ${product.precio.detalle}</p>
          <p className="text-xl font-bold">Precio Mayoreo: ${product.precio.mayoreo}</p>
          <p className="text-md font-bold">SKU: {product.sku}</p>

          {product.fecha_agregado && (
            <p className="text-sm text-gray-500 mt-2">
              Fecha Agregado: {new Date(product.fecha_agregado).toLocaleDateString()}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;