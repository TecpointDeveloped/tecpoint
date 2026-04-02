import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useCartStore } from "../../lib/cartStore";
import { useAuth } from "@/context/useAuth";
import { CartItem } from "@/types/ProductTypes";
import Footer from "@/components/Footer/page";

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Función para formatear precios con comas de miles
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const { cart: storedCart } = useCartStore();
  const { currentUser } = useAuth();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  const users = [
    {
      name: "Oficina Principal - Barrio Los Andes",
      username: "barrio los andes",
      role: "Oficina Principal",
      status: "Active",
      address: "7 Calle A - 14 Avenida N.O, San Pedro Sula"
    },
    {
      name: "Kiosco - Plaza Carolina",
      username: "plaza carolina",
      role: "Plaza Carolina",
      status: "Active",
      address: "Boulevard Mackey, San Pedro Sula"
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
    const phoneNumberPrincipal = "50497157784"; // Oficina Principal Los Andes
    const phoneNumberCarolina = "50493385732"; // Plaza Carolina

    let phoneNumber = phoneNumberPrincipal;
    let selectedAddress = users[0]?.name || "";

    if (selectedUserIndex !== null) {
      switch (users[selectedUserIndex].username) {
        case "barrio los andes":
          phoneNumber = phoneNumberPrincipal;
          selectedAddress = users[0].name;
          break;
        case "plaza carolina":
          phoneNumber = phoneNumberCarolina;
          selectedAddress = users[1].name;
          break;
        default:
          phoneNumber = phoneNumberPrincipal;
          selectedAddress = users[0].name;
      }
    }

    const message = `Hola Tecpoint 👋\n\nQuiero realizar un pedido para: ${selectedAddress}\n\n${cart.map(item => `📦 Producto: ${item.producto}\n   SKU: ${item.sku}\n   Cantidad: ${item.quantity}`).join('\n\n')}`;
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(waLink, "_blank");
  };

  return (
    <>
      <Head>
        <title>Carrito de Compras | Tecpoint Honduras</title>
        <meta name="description" content="Tu carrito de compras en Tecpoint. Revisa tus accesorios seleccionados y completa tu compra. Envío 24-48h, pago al recibir." />
        <meta name="keywords" content="carrito de compras, tienda accesorios técnicos, compra online Honduras" />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://tecpoint.ws/cart" />

        <meta property="og:title" content="Carrito de Compras | Tecpoint" />
        <meta property="og:description" content="Completa tu compra de accesorios tech en Tecpoint. Envío a Honduras." />
        <meta property="og:url" content="https://tecpoint.ws/cart" />
        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tecpoint Distribucion - Honduras" />
        <meta property="og:locale" content="es_HN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Carrito de Compras | Tecpoint" />
        <meta name="twitter:description" content="Carrito de compras de Tecpoint. Compra accesorios tech con envío 24-48h." />
        <meta name="twitter:image" content="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/logos%2Fog_image.png?alt=media&token=26d74138-1987-4143-86ce-31eab8af8338" />
      </Head>

      <NavbarMenu />

      <main className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Carrito de Compras</h1>
            <p className="text-gray-600">Revisa tus productos y completa tu pedido</p>
          </div>

          {cart.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Productos */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{cart.length}</span>
                    Productos en tu carrito
                  </h2>

                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">

                        {/* Imagen */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          <Image
                            priority
                            src={typeof item.imagenes !== 'string' ? item.imagenes?.imagen_01?.img ?? "/default-product.png" : "/default-product.png"}
                            alt={item.producto || "Producto"}
                            width={80}
                            height={80}
                            quality={90}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{item.producto}</h3>
                          <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-gray-900">Lps. {formatPrice(item.precio || 0)}</span>
                            <span className="text-sm text-gray-500">× {item.quantity}</span>
                          </div>
                        </div>

                        {/* Cantidad y Eliminar */}
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                            <button
                              onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                              className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="px-3 py-1.5 font-semibold min-w-[40px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>

                        {/* Total */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Lps. {formatPrice((item.precio || 0) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Banner Forza Delivery */}
                <div className="bg-[#FF3B01] rounded-2xl p-4 text-white">
                  <div className="flex items-center mb-3">
                    <Image
                      quality={96}
                      src="/logos/forzaDelivery.png"
                      alt="Envío mediante Forza Delivery"
                      width={100}
                      height={40}
                      className="h-[40px] w-auto"
                    />
                  </div>
                  <div className="space-y-2 text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span>Pago al recibir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span>24 a 48 horas (días hábiles)</span>
                    </div>
                  </div>
                </div>

                {/* Info Envío */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#16a34a" className="w-5 h-5 flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-semibold text-green-900">Envío a todo Honduras</p>
                    <p className="text-green-700 text-xs mt-0.5">Envíos seguros y rápidos con Forza Delivery.</p>
                  </div>
                </div>
              </div>

              {/* Sidebar - Resumen y Ubicación */}
              <div className="space-y-4">

                {/* Seleccionar Ubicación */}
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                  <h3 className="font-bold text-gray-900 mb-4">Selecciona una sucursal</h3>

                  <div className="space-y-2 mb-6">
                    {users.map((user, index) => (
                      <label key={index} className="flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-colors" style={{ borderColor: selectedUserIndex === index ? '#000' : '#e5e7eb', backgroundColor: selectedUserIndex === index ? '#f9fafb' : '#fff' }}>
                        <input
                          type="radio"
                          name="sucursal"
                          checked={selectedUserIndex === index}
                          onChange={() => setSelectedUserIndex(index)}
                          className="w-4 h-4 mt-0.5"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{user.role}</p>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{user.address}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4">Resumen del pedido</h3>

                  <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">Lps. {formatPrice(cart.reduce((acc, item) => acc + ((item.precio || 0) * item.quantity), 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-semibold text-green-600">Gratis*</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6 text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-gray-900">Lps. {formatPrice(cart.reduce((acc, item) => acc + ((item.precio || 0) * item.quantity), 0))}</span>
                  </div>

                  {currentUser && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                      <p className="text-gray-600">Cuenta:</p>
                      <p className="font-semibold text-gray-900">{currentUser.displayName || "Usuario"}</p>
                    </div>
                  )}

                  <button
                    onClick={handleWhatsAppOrder}
                    disabled={!selectedUserIndex}
                    className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Realizar Pedido
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    * Envío gratis en compras mayores a Lps. 1,500
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600 mb-6">Agrega productos a tu carrito para comenzar tu compra</p>
              <Link href="/shop?page=1&brand=&search=" className="inline-block bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors">
                Ir a la Tienda
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CartPage;