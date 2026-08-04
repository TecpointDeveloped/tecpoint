import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "../../lib/cartStore";
import { useAuth } from "@/context/useAuth";
import { Checkbox } from "@heroui/checkbox";
import { CartItem } from "@/types/ProductTypes";
import { trackInitiateCheckout } from "@/lib/tracking";

const CartPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [referralInput, setReferralInput] = useState("");
  const [referralError, setReferralError] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [appliedReferral, setAppliedReferral] = useState<null | { code: string; ownerName: string; discountPercent: number; subtotal: number; discount: number; total: number }>(null);

  const { cart: storedCart } = useCartStore();
  const { currentUser } = useAuth();
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  const users = [
    {
      name: "Kiosco Plaza Carolina",
      username: "plaza carolina",
      role: "Plaza Carolina · San Pedro Sula",
      status: "Active",
    },
    {
      name: "Portal de Viera",
      username: "portal de viera",
      role: "Portal de Viera · Tegucigalpa",
      status: "Active",
    },
    {
      name: "Mayoreo y Pick Up",
      username: "mayoreo",
      role: "Mayoreo y Pick Up · Barrio Los Andes",
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
    setAppliedReferral(null);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart_tecpoint", JSON.stringify(updatedCart));
    setAppliedReferral(null);
  };

  const referralItems = () => cart.map((item) => ({ sku: item.sku, quantity: item.quantity }));

  const applyReferral = async () => {
    setReferralLoading(true);
    setReferralError("");
    try {
      const response = await fetch("/api/referrals/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: referralInput, items: referralItems() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible aplicar el código.");
      setAppliedReferral(data);
      setReferralInput(data.code);
    } catch (error) {
      setAppliedReferral(null);
      setReferralError(error instanceof Error ? error.message : "Código inválido.");
    } finally { setReferralLoading(false); }
  };

  const handleWhatsAppOrder = async () => {
    if (orderSubmitting) return;
    const phoneNumberTegucigalpa = "95200523";
    const phoneNumberCarolina = "93385732";
    const phoneNumberPrincipal = "97157784";
    const phoneNumberWholesale = "98191003";

    let phoneNumber = phoneNumberPrincipal;

    if (selectedUserIndex !== null) {
      switch (users[selectedUserIndex].username) {
        case "portal de viera":
          phoneNumber = phoneNumberTegucigalpa;
          break;
        case "plaza carolina":
          phoneNumber = phoneNumberCarolina;
          break;
        case "mayoreo":
          phoneNumber = phoneNumberWholesale;
          break;
        default:
          phoneNumber = phoneNumberPrincipal;
      }
    }

    if (appliedReferral) {
      setOrderSubmitting(true);
      try {
        const response = await fetch("/api/referrals/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: appliedReferral.code, items: referralItems(), channel: "web_whatsapp", location: selectedUserIndex === null ? "online" : users[selectedUserIndex].name }) });
        if (!response.ok) { setReferralError("No fue posible registrar el código. Inténtelo nuevamente o contacte a un asesor."); return; }
      } catch {
        setReferralError("No fue posible registrar el código. Revise su conexión e inténtelo nuevamente.");
        return;
      } finally {
        setOrderSubmitting(false);
      }
    }
    const referralSummary = appliedReferral ? `\nCódigo: ${appliedReferral.code}\nDescuento: L ${appliedReferral.discount.toFixed(2)}\nTotal con descuento: L ${appliedReferral.total.toFixed(2)}\n` : "";
    const message = `Hola Tecpoint, quiero realizar un pedido:\n\n${cart.map(item => `Producto: ${item.producto}\nSKU: ${item.sku}\nCantidad: ${item.quantity}\n`).join('\n')}${referralSummary}`;
    const total = cart.reduce((sum, item) => sum + (item.precio || 0) * item.quantity, 0);
    trackInitiateCheckout(
      cart.map((item) => ({
        id: item.sku || item.id,
        name: item.producto || "Producto TECPOINT",
        price: item.precio || 0,
        quantity: item.quantity,
      })),
      appliedReferral?.total ?? total,
    );
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

      <main className="flex min-h-[calc(100vh-80px)] flex-col lg:flex-row gap-4 md:justify-between lg:justify-evenly mt-[80px]">
        <h1 className="sr-only">Carrito de compras TECPOINT</h1>
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
                    quality={70}
                    sizes="100px"
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
              <span className="font-bold">HNL. {(appliedReferral?.subtotal ?? cart.reduce((acc, item) => acc + (item.precio || 0) * item.quantity, 0)).toFixed(2)}</span>
            </div>
            <div className="my-5 rounded-2xl border border-[#dfe3e4] p-4">
              <label htmlFor="referral-code" className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#c8102e]">Código de empleado, influencer o promoción</label>
              <div className="flex gap-2">
                <input id="referral-code" value={referralInput} onChange={(event) => { setReferralInput(event.target.value.toUpperCase()); setReferralError(""); }} placeholder="EJ. JORGE15" className="min-w-0 flex-1 rounded-xl border px-4 py-3 uppercase outline-none focus:border-[#c8102e]" />
                <button type="button" onClick={applyReferral} disabled={referralLoading || !cart.length || !referralInput.trim()} className="rounded-xl bg-[#c8102e] px-5 text-sm font-bold text-white disabled:opacity-50">{referralLoading ? "Validando…" : "Aplicar"}</button>
              </div>
              {referralError && <p className="mt-2 text-sm text-[#a90d28]">{referralError}</p>}
              {appliedReferral && <p className="mt-3 rounded-xl bg-[#fff1f3] p-3 text-sm text-[#8f0b24]"><strong>{appliedReferral.code}</strong> aplicado · 15% de descuento · Referido por {appliedReferral.ownerName}</p>}
            </div>
            {appliedReferral && <div className="flex justify-between mb-2 text-[#c8102e]"><span>Descuento ({appliedReferral.discountPercent}%):</span><span className="font-bold">− HNL. {appliedReferral.discount.toFixed(2)}</span></div>}
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">ISV (15%):</span>
              <span className="font-bold">HNL. 0.00</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-700">Total:</span>
              <span className="font-bold">HNL. {(appliedReferral?.total ?? cart.reduce((acc, item) => acc + (item.precio || 0) * item.quantity, 0)).toFixed(2)}</span>
            </div>
            <button
              onClick={handleWhatsAppOrder}
              disabled={orderSubmitting}
              className="w-full bg-black text-white py-3 hover:bg-black/80 transition duration-300 disabled:cursor-wait disabled:opacity-60"
            >
              {orderSubmitting ? "Registrando código…" : "Realizar Pedido"}
            </button>
          </div>
        </div>
      </main >
    </>
  );
};

export default CartPage;
