import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";
// import PayPalButton from "@/components/PayPalButton/page";
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
import { useCartStore } from "../../lib/cartStore"
import { useAuth } from "@/context/useAuth";

interface CartItem {
  id: string;
  quantity: number;
  sku?: string;
  imagenes?: { imagen_01?: { id?: string, img?: string } } | string;
  precio?: number;
  producto?: string;
}

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { cart: storedCart } = useCartStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const updatedCart = storedCart.map((item: CartItem) => {
      const imagenes = typeof item.imagenes === 'string' ? { imagen_01: { id: "", img: item.imagenes } } : item.imagenes ?? { imagen_01: { id: "", img: "" } };
      return {
        ...item,
        imagenes,
      };
    });

    setCart(updatedCart);
  }, [storedCart]);

  const handleRemoveFromCart = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
  };

  // const handlepayment = async () => {
  //   const settings = new Settings()
  //   // settings.setupEndpoint("https://hn.ficoposonline.com/")
  //   // settings.setupCredentials("FHI372717363", "b36aa20b0010f042b5bf788a4793b902")
  //   settings.setupSandbox()

  //   const card = new Card()
  //   card.number = "4111111111111111"
  //   card.cvv2 = "999"
  //   card.expire_month = 7
  //   card.expire_year = 2027
  //   card.cardholder = "SERGIO PEREZ"

  //   const billing = new Billing()
  //   billing.address = "Ave Circunvalacion"
  //   billing.country = "HN"
  //   billing.state = "HN-CR"
  //   billing.city = "San Pedro Sula"
  //   billing.phone = "99999999"

  //   const item = new Item()
  //   item.code = "00001"
  //   item.title = "Videojuego"
  //   item.price = 8
  //   item.qty = 1

  //   const order = new Order()
  //   order.id = "ORDER-88888"
  //   order.currency = "HNL"
  //   order.customer_name = "SERGIO PEREZ"
  //   order.customer_email = "sergio.perez@gmail.com"
  //   order.addItem(item)

  //   const sale = new SaleTransaction()
  //   sale.setOrder(order)
  //   sale.setCard(card)
  //   sale.setBilling(billing)

  //   const service = new Transaction(settings)

  //   // Con async / await
  //   try {
  //     const response = await service.doSale(sale)
  //     console.log(response)

  //     if (TransactionResult.validateResponse(response)) {
  //       const result = TransactionResult.fromResponse(response)

  //       // const is_valid_payment = service.verifyPaymentHash(
  //       //   result.payment_hash,
  //       //   order.id,
  //       //   "abc...", // secret
  //       // )

  //       if (result) {
  //         alert(response.message)
  //       }
  //     }
  //   } catch (error) {
  //     // ERROR
  //     console.error("Ocurrio un error al realizar el pago", error)
  //   }

  //   // // Con callback
  //   // service.doSale(sale).then((response) => {
  //   //   if (TransactionResult.validateResponse(response)) {
  //   //     const result = TransactionResult.fromResponse(response)

  //   //     // const is_valid_payment = service.verifyPaymentHash(
  //   //     //   result.payment_hash,
  //   //     //   order.id,
  //   //     //   "abc...", // secret
  //   //     // )

  //   //     if (result) {
  //   //       alert("pago realizado con exito")
  //   //     }
  //   //   }
  //   // }).catch((error) => {
  //   //   console.error("Ocurrio un error al realizar el pago", error)
  //   // })
  // }

  const handleWhatsAppOrder = () => {
    const phoneNumber = "97157784";
    const message = `Hola Tecpoint, quiero realizar un pedido:\n\n${cart.map(item => `Producto: ${item.producto}\nSKU: ${item.sku}\nCantidad: ${item.quantity}\n`).join('\n')}`;
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(waLink, "_blank");
  };

  return (
    <>
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

      <main className="flex flex-col md:h-[87dvh] lg:flex-row gap-4 md:justify-between lg:justify-evenly">
        <div className="py-4 px-6 w-full md:w-1/2 md:h-auto overflow-hidden overflow-y-scroll
        [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-transparent
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb]:bg-gray-300
      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
        ">
          {cart.length > 0 ? (
            <ul className="space-y-4 flex flex-col gap-y-3">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 w-full relative">
                  <Image
                    priority
                    src={typeof item.imagenes !== 'string' ? item.imagenes?.imagen_01?.img ?? "/default-product.png" : "/default-product.png"}
                    alt={item.producto || "Producto"}
                    width={100}
                    height={100}
                    quality={100}
                    className="object-cover aspect-square"
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

        <div className="py-4 px-6 w-full md:w-1/2 bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Cuenta:</span>
              <span className="font-bold">{currentUser?.displayName ?? "Invitado"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-bold">HNL. {cart.reduce((acc, item) => acc + (item.precio || 0) * item.quantity, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">ISV (15%):</span>
              <span className="font-bold">HNL. 0.00</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-700">Total:</span>
              <span className="font-bold">HNL. {cart.reduce((acc, item) => acc + (item.precio || 0) * item.quantity, 0).toFixed(2)}</span>
            </div>
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-black/80 transition duration-300"
            >
              Realizar Pedido
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default CartPage;