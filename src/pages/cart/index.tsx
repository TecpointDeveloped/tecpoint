import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "../../lib/cartStore";
import { useAuth } from "@/context/useAuth";
import { Checkbox } from "@heroui/checkbox";
import { GiftCode, CartItem } from "@/types/ProductTypes";

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [giftCode, setGiftCode] = useState<string>("");
  const [giftCodeMessage, setGiftCodeMessage] = useState<string | null>(null);
  const [giftCodeValid, setGiftCodeValid] = useState<boolean>(false);

  const { cart: storedCart } = useCartStore();
  const { currentUser } = useAuth();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  const users = [
    {
      name: "Kiosco Plaza Carolina",
      username: "plaza carolina",
      role: "Kiosco Plaza Carolina",
      status: "Active",
    },
    {
      name: "Kiosco City Mall",
      username: "city mall",
      role: "Kiosco City Mall",
      status: "Active",
    },
    {
      name: "Tienda Barrio el Benque",
      username: "tienda bario el benque",
      role: "Tienda Barrio el Benque",
      status: "Active",
    }
  ];

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

  const handleQuantityChange = (id: string, quantity: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
  };

  const handleWhatsAppOrder = () => {
    const phoneNumberCityMall = "95200523";
    const phoneNumberCarolina = "93385732";
    const phoneNumberPrincipal = "97157784";

    let phoneNumber = phoneNumberPrincipal;

    if (selectedUserIndex !== null) {
      switch (users[selectedUserIndex].username) {
        case "city mall":
          phoneNumber = phoneNumberCityMall;
          break;
        case "plaza carolina":
          phoneNumber = phoneNumberCarolina;
          break;
        default:
          phoneNumber = phoneNumberPrincipal;
      }
    }

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
                    <span className="flex gap-2">
                      <p className="bg-black text-white rounded-md py-1 px-2 size-fit text-[13px]">{item.sku}</p>
                    </span>
                    <span className="flex items-center gap-4">
                      <p className="text-gray-500">Cantidad:
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          className="ml-2 w-14 text-center border rounded p-1"
                          min="1"
                        />
                      </p>
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
            <div className="size-full grid place-content-center">
              <p className="text-center text-gray-600">No tienes productos en el carrito.</p>
            </div>
          )}
        </div>

        <div className="py-4 px-6 flex flex-col gap-4 w-full md:w-1/2 bg-gray-100">
          <div className="flex flex-wrap w-full bg-white p-2">
            {users.map((user, index) => (
              <Checkbox
                key={index}
                aria-label={user.name}
                isSelected={selectedUserIndex === index}
                onValueChange={() => setSelectedUserIndex(index)}
                className="border p-4 w-[280px] m-2"
              >
                <div className="flex justify-between gap-2 w-[280px]">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-lg text-default-500">{user.role}</span>
                  </div>
                </div>
              </Checkbox>
            ))}
          </div>

          <div className="bg-white p-4">
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
              className="w-full bg-black text-white py-3 hover:bg-black/80 transition duration-300"
            >
              Realizar Pedido
            </button>
          </div>
        </div>
      </main >
    </>
  );
};

export default CartPage;