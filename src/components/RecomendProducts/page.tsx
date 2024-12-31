import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Product } from "../../types/ProductTypes";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";

export const RecommendedProducts = ({ currentProduct }: { currentProduct: Product }) => {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      try {
        const productsRef = collection(db, process.env.NEXT_PUBLIC_DATABASE_NAME as string);
        const q = query(productsRef, where("categorias", "==", currentProduct.categorias));
        const querySnapshot = await getDocs(q);

        const products = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Product[];

        setRecommendedProducts(products.filter((product) => product.categorias !== currentProduct.categorias));
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
    <section className="">
      <h2 className="text-center text-2xl font-semibold mb-6">Productos Recomendados</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {recommendedProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-md p-4 cursor-pointer w-[300px]"
            onClick={() => handleProductClick(product.slug)}
          >
            <Image
              src={product.imagenes[0].img}
              alt={product.producto}
              width={300}
              height={300}
              className="object-cover w-full h-48"
            />
            <h3 className="text-lg font-semibold mt-2">{product.producto}</h3>
            <p className="text-gray-600">{product.precio.detalle}.00 HNL</p>
          </div>
        ))}
      </div>
    </section>
  );
};