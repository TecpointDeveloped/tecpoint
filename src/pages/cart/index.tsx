import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";
import PayPalButton from "@/components/PayPalButton/page";

import Settings from "@pixelpay/sdk-core/lib/models/Settings";
import Card from "@pixelpay/sdk-core/lib/models/Card";
import Billing from "@pixelpay/sdk-core/lib/models/Billing";
import Item from "@pixelpay/sdk-core/lib/models/Item";
import Order from "@pixelpay/sdk-core/lib/models/Order";
import SaleTransaction from "@pixelpay/sdk-core/lib/requests/SaleTransaction";
import Transaction from "@pixelpay/sdk-core/lib/services/Transaction";
import TransactionResult from "@pixelpay/sdk-core/lib/entities/TransactionResult";

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

  const handlePayment = async () => {
    const orderData = {
      settings: {
        endpoint: "https://pixel-pay.com.com",
        credentials: {
          username: "FHI372717363",
          password: "b36aa20b0010f042b5bf788a4793b902",
        },
      },
      card: {
        number: "4111111111111111",
        cvv2: "2512",
        expire_month: 9,
        expire_year: 2027,
        cardholder: "Aerley Keller Lopez Ramos",
      },
      billing: {
        address: "9 avenida",
        country: "HN",
        state: "HN-CR",
        city: "San Pedro Sula",
        phone: "98007330",
      },
      order: {
        id: `ORDER-${Date.now()}`,
        currency: "HNL",
        customer_name: "Aerley Lopez",
        customer_email: "example@gmail.com",
        items: cart.map((item) => ({
          code: item.sku || "00000",
          title: item.producto || "Producto sin nombre",
          price: item.precio || 0,
          qty: item.quantity,
        })),
      },
    };

    try {
      const response = await fetch("/api/transaction/sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(`Error al procesar la solicitud. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Resultado de la respuesta:", result);

      const isValidPayment = result.is_valid_payment;
      if (isValidPayment) {
        alert("Pago realizado con éxito");
      } else {
        alert("El pago no fue válido");
      }
    } catch (error) {
      console.error("Error al realizar el pago:", error);
      alert("Hubo un error al procesar el pago.");
    }
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

        <div className="flex justify-center mt-6 pr-12 h-[80vh] overflow-hidden overflow-y-scroll">
            <PayPalButton
              total={getTotal()}
              onSuccess={(details) => console.log("Pago exitoso", details)}
            />

          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-blue-500 text-white rounded-md size-fit">
            pagar
          </button>
        </div>
      </main>
    </div>
  );
};

export default CartPage;