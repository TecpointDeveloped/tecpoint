import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";
import PayPalButton from "@/components/PayPalButton/page"; // Importa el botón de PayPal

interface CartItem {
  id: string;
  quantity: number;
  sku?: string;
  imagenes?: { imagen_01?: { id?: string, img?: string } };
  precio?: number;
  producto?: string;
}

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart: CartItem[] = JSON.parse(localStorage.getItem("cart_tecpoint") || "[]");

    const updatedCart = storedCart.map((item: CartItem) => ({
      ...item,
      imagenes: item.imagenes || {},
    }));

    setCart(updatedCart);
  }, []);

  const handleRemoveFromCart = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
  };

  // Calcular el total de la compra
  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.precio || 0) * item.quantity, 0)
  };

  return (
    <div className="bg-gray-100 w-full h-screen">
      <NavbarMenu />

      <main className="p-4 flex flex-col lg:flex-row gap-4 md:justify-between lg:justify-evenly">
        <div className="py-4 px-6 bg-white w-full lg:w-fit h-fit rounded-xl">
          {cart.length > 0 ? (
            <ul className="space-y-4 flex flex-col gap-y-2">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-b pb-2 w-[500px]">
                  <Image
                    src={item.imagenes?.imagen_01?.img || "/default-product.png"}
                    alt={item.producto || "Producto"}
                    width={90}
                    height={90}
                    quality={100}
                    className="object-cover aspect-square"
                  />
                  <div className="w-fit">
                    <h3 className="text-md font-semibold tracking-[-0.2px] leading-5">{item.producto}</h3>
                    <p className="text-gray-600">Cantidad: {item.quantity}</p>
                    <p className="text-gray-600">Lps. {item.precio?.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No tienes productos en el carrito.</p>
          )}
        </div>

        {/* Mostramos el botón de PayPal con el total de la compra */}
        <div className="flex justify-center mt-6 pr-12 h-[80vh] overflow-hidden overflow-y-scroll">
          <PayPalButton
            total={getTotal()}
            onSuccess={(details) => console.log("Pago exitoso", details)}
          />
        </div>
      </main>
    </div>
  );
};

export default CartPage;