import Image from "next/image";
import { useEffect, useState } from "react";
import { Product } from "../../types/ProductTypes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Link from "next/link";
import { enrichProduct, isNewProduct, preferredProductSlug, publicCatalog } from "@/lib/catalog";
import { productImageFallback } from "@/lib/imageFallback";

export const RecommendedProducts = ({ currentProduct }: { currentProduct: Product }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
        const q = query(productsRef, where("marca_producto.marca", "==", currentProduct.marca_producto.marca));
        const querySnapshot = await getDocs(q);

        const products = publicCatalog(querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return enrichProduct({
            ...data,
            id: doc.id,
            fecha_agregado: data.fecha_agregado?.toDate?.().toISOString() || null,
          } as Product);
        })) as Product[];

        setRecommendedProducts(products);
        console.log("produtos recomendados:", products);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    if (currentProduct.categorias) {
      fetchRecommendedProducts();
    }
  }, [currentProduct]);


  return (
    <section className="mt-12 mb-12">
      <h2 className="text-center text-2xl font-semibold mb-6">Productos Recomendados</h2>

      <Carousel
        className="w-full md:max-w-[85%] md:m-auto p-2 md:p-0"
        opts={{
          loop: true,
          align: "center",
        }}
      >
        <CarouselContent className="flex gap-4 px-6 py-2">
          {recommendedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="border rounded-[26px] p-4 flex flex-col max-w-[300px] h-[460px] relative justify-between"
            >
              {isNewProduct(product) && (
                <span className="bg-[#c8102e] z-[2] absolute top-4 left-4 rounded-full px-3 py-1 shadow-lg">
                  <p className="text-[11px] font-extrabold uppercase tracking-[.08em] text-white">Nuevo</p>
                </span>
              )}

              <div className="flex flex-col">
                <Link
                  href={`/shop/${preferredProductSlug(product)}`}
                  className="hover:scale-105 transition-transform"
                  rel="noopener noreferrer"
                  download={false}
                >
                  <Image
                    src={product.imagenes?.imagen_01?.img || Object.values(product.imagenes || {})[0]?.img || "/default-product.png"}
                    alt={
                      product.producto
                        ? `Imagen de ${product.producto}`
                        : "Imagen del producto"
                    }
                    width={240}
                    height={240}
                    className="m-auto size-[240px] aspect-square object-cover mb-4"
                    quality={75}
                    onError={productImageFallback}
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
                <Link className="w-full h-full py-[10px] px-4" href={`/shop/${preferredProductSlug(product)}`}>
                  Ver Producto
                </Link>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
