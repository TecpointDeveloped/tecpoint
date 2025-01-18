import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";
import PayPalButton from "@/components/PayPalButton/page";
import Head from "next/head";
import { Separator } from "@/components/ui/separator";

// import Settings from "@pixelpay/sdk-core/lib/models/Settings";
// import Card from "@pixelpay/sdk-core/lib/models/Card";
// import Billing from "@pixelpay/sdk-core/lib/models/Billing";
// import Item from "@pixelpay/sdk-core/lib/models/Item";
// import Order from "@pixelpay/sdk-core/lib/models/Order";
// import SaleTransaction from "@pixelpay/sdk-core/lib/requests/SaleTransaction";
// import Transaction from "@pixelpay/sdk-core/lib/services/Transaction";
// import TransactionResult from "@pixelpay/sdk-core/lib/entities/TransactionResult";

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
        endpoint: "https://pixel-pay.com",
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
    <div className="">
      <Head>
        <title>Carrito de compras | Tecpoint</title>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="keywords" content="Carrito de compras, Tecpoint, Distribuidor de accesorios tecnológicos" />
        <meta name="description" content="Carrito de compras de Tecpoint, distribuidor de accesorios tecnológicos en Honduras." />
        <meta property="og:url" content="https://tecpoint.ws/cart" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta property="og:title" content="Carrito de compras | Tecpoint" />
        <meta property="og:description" content="Carrito de compras de Tecpoint, distribuidor de accesorios tecnológicos en Honduras." />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Carrito de compras | Tecpoint" />
        <meta name="twitter:description" content="Carrito de compras de Tecpoint, distribuidor de accesorios tecnológicos en Honduras." />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta name="twitter:image:alt" content="Carrito de compras | Tecpoint" />
      </Head>
      <NavbarMenu />

      <main className="p-4 flex flex-col lg:flex-row gap-4 md:justify-between lg:justify-evenly">
        <div className="py-4 px-6 bg-white w-full lg:w-fit h-fit">
          {cart.length > 0 ? (
            <ul className="space-y-4 flex flex-col gap-y-3">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 w-[480px] relative">
                  <Image
                    priority
                    src={item.imagenes?.imagen_01?.img || "/default-product.png"}
                    alt={item.producto || "Producto"}
                    width={100}
                    height={100}
                    quality={100}
                    className="object-cover aspect-square bg-gray-100 p-2"
                  />
                  <div className="w-[340px] flex flex-col gap-2">
                    <h3 className="text-[17px] font-semibold tracking-[-0.2px] leading-5">{item.producto}</h3>
                    <span className="flex items-center gap-4">
                      <p className="text-gray-500">Cantidad: <span className="font-bold">{item.quantity}</span></p>
                      <p className="text-gray-500">HNL. <span className="font-bold">{item.precio?.toFixed(2)}</span></p>
                    </span>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-500 hover:underline absolute right-0 top-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <Separator className="absolute -bottom-2" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No tienes productos en el carrito.</p>
          )}
        </div>

        <div className="w-1/2">
          <h1>Selecciona un Metodo de Pago</h1>

          <div>
            
          </div>
        </div>

        {/* <div className="flex justify-center mt-6 pr-12 h-[80vh] overflow-hidden overflow-y-scroll">
          <PayPalButton
            total={getTotal()}
            onSuccess={(details) => console.log("Pago exitoso", details)}
          />

          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-blue-500 text-white rounded-md size-fit">
            pagar
          </button>
        </div> */}
      </main>
    </div>
  );
};

export default CartPage;