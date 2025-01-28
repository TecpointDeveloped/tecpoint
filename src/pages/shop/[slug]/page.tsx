import { GetStaticPaths, GetStaticProps } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/database/Config";
import NavbarMenu from "@/components/navbarmenu/page";
import Head from "next/head";

interface Product {
  id: string;
  categoria: string[];
  descripcion: string;
  fecha_agregado: string | null;
  imagenes: { [key: string]: { id: string; img: string } };
  marca_producto: {
    logo: string;
    marca: string;
  };
  precio: {
    detalle: number;
    mayoreo: number;
  };
  producto: string;
  sku: string;
  slug: string;
  stock?: boolean;
  upc?: string;
}

interface ProductDetailProps {
  product: Product | null;
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Products")); // Asegúrate de que "Products" es el nombre correcto de tu colección
    const paths = querySnapshot.docs.map((doc) => ({
      params: { slug: doc.data().slug },
    }));

    return {
      paths,
      fallback: "blocking", // Permite generar páginas bajo demanda si el slug no está pre-generado
    };
  } catch (error) {
    console.error("Error al obtener los slugs:", error);
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;

  try {
    const q = query(
      collection(db, "Products"),
      where("slug", "==", slug) // Buscar el producto por el campo "slug"
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        notFound: true, // Si no se encuentra el producto, retornar 404
      };
    }

    const product = querySnapshot.docs[0].data() as Product;

    return {
      props: {
        product,
      },
      revalidate: 60, // Revalidar cada 60 segundos (ISR)
    };
  } catch (error) {
    console.error("Error al cargar el producto:", error);
    return {
      notFound: true,
    };
  }
};

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl font-bold">Producto no encontrado</p>
      </div>
    );
  }

  const imagenesArray = Object.values(product.imagenes);

  return (
    <div>
      <NavbarMenu />
      <Head>
        <title>{product.producto} | Tienda Tecpoint</title>
        <meta
          name="description"
          content={product.descripcion || "Descripción no disponible"}
        />
        <meta property="og:title" content={product.producto} />
        <meta
          property="og:description"
          content={product.descripcion || "Descripción no disponible"}
        />
        <meta property="og:image" content={imagenesArray[0]?.img || "/default.png"} />
      </Head>

      <div className="w-full mx-auto p-4 mt-12">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            {/* Mostrar imágenes del producto */}
            {imagenesArray.map((imagen, index) => (
              <img
                key={index}
                src={imagen.img}
                alt={`Imagen ${index + 1} de ${product.producto}`}
                className="w-full rounded-md mb-4"
              />
            ))}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{product.producto}</h1>
            <p className="text-lg text-gray-600">{product.descripcion}</p>
            <p className="mt-4 text-lg font-bold text-green-600">
              Precio Detalle: ${product.precio.detalle}
            </p>
            <p className="text-lg font-bold text-blue-600">
              Precio Mayoreo: ${product.precio.mayoreo}
            </p>

            {/* Mostrar categorías */}
            <div className="flex flex-wrap gap-2 mt-6">
              {product.categoria.map((cat, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 text-sm font-semibold px-3 py-1 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Botón para comprar */}
            <button className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-red-600">
              Comprar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;