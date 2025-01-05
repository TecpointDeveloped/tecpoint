import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Product } from "../../types/ProductTypes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel"
import Link from "next/link";
import { Car } from "lucide-react";

export const RecommendedProducts = ({ currentProduct }: { currentProduct: Product }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
        const q = query(productsRef, where("marca_producto.marca", "==", currentProduct.marca_producto.marca));
        const querySnapshot = await getDocs(q);

        const products = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Product[];

        setRecommendedProducts(products);
        console.log("produtos recomendados:", recommendedProducts);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    if (currentProduct.categorias) {
      fetchRecommendedProducts();
    }
  }, [currentProduct]);

  const handleProductClick = (slug: string) => {
    router.push(`/shop/${slug}`);
  };

  return (
    <section className="mt-12 mb-12">
      <h2 className="text-center text-2xl font-semibold mb-6">Productos Recomendados</h2>

      <Carousel opts={{ align: "start", }} className="w-full md:max-w-[85%] md:m-auto">
        <CarouselContent className="flex gap-4 px-6 py-2">
          {recommendedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="border rounded-[26px] p-4 flex flex-col max-w-[300px] h-[460px] relative justify-between"
            >

              <span className="bg-[#09f] z-[2] absolute top-4 left-4 rounded-full px-3 py-1">
                <p className="text-[12px] font-semibold text-white">Nuevo</p>
              </span>

              <div className="flex flex-col">
                <Link
                  href={`/shop/${product.slug}`}
                  className="hover:scale-105 transition-transform"
                  rel="noopener noreferrer"
                  download={false}
                >
                  <Image
                    src={product.imagenes && product.imagenes[0] ? product.imagenes[0].img : "/default-product.png"}
                    alt={
                      product.producto
                        ? `Imagen de ${product.producto}`
                        : "Imagen del producto"
                    }
                    width={240}
                    height={240}
                    className="m-auto size-[240px] aspect-square object-cover mb-4"
                    quality={100}
                    priority
                  />
                </Link>

                <div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.2px] leading-[18px]">
                    {product.producto.slice(0, 55)}
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
                <Link className="w-full h-full py-[10px] px-4" href={`/shop/${product.slug}`}>
                  Ver Producto
                </Link>
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>


      {/* <div className="flex flex-wrap gap-4 justify-center">
        {recommendedProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-md p-4 cursor-pointer w-[300px]"
            onClick={() => handleProductClick(product.slug)}
          >
            <Image
              src={product.imagenes && product.imagenes[0] ? product.imagenes[0].img : "/default-product.png"}
              alt={product.producto}
              width={300}
              height={300}
              className="object-cover w-full h-48"
            />
            <h3 className="text-lg font-semibold mt-2">{product.producto}</h3>
            <p className="text-gray-600">{product.precio.detalle}.00 HNL</p>
          </div>
        ))}
      </div> */}
    </section>
  );
};