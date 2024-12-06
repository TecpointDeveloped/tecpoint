import NavbarMenu from "@/components/navbarmenu/page";
import Image from "next/image";
import { useEffect, useState } from "react";

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
  imagenes?: { imagen_01?: string; imagen_02?: string };
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

  const handlePayment = async () => {
    const settings = new Settings();
    settings.setupEndpoint("https://ficoposonline.com");
    settings.setupCredentials("FHI372717363", "b36aa20b0010f042b5bf788a4793b902");

    const card = new Card();
    card.number = "4042635200319965";
    card.cvv2 = "999";
    card.expire_month = 9;
    card.expire_year = 2027;
    card.cardholder = "Aerley Lopez";

    const billing = new Billing();
    billing.address = "9 avenida";
    billing.country = "HN";
    billing.state = "HN-CR";
    billing.city = "San Pedro Sula";
    billing.phone = "98007330";

    const order = new Order();
    order.id = `ORDER-${Date.now()}`;
    order.currency = "HNL";
    order.customer_name = "Aerley Lopez";
    order.customer_email = "lopezkeller65@gmail.com";

    cart.forEach((item) => {
      const orderItem = new Item();
      orderItem.code = item.sku || "00000";
      orderItem.title = item.producto || "Producto sin nombre";
      orderItem.price = item.precio || 0;
      orderItem.qty = item.quantity;
      order.addItem(orderItem);
    });

    const sale = new SaleTransaction();
    sale.setOrder(order);
    sale.setCard(card);
    sale.setBilling(billing);

    const service = new Transaction(settings);

    try {
      const response = await service.doSale(sale);

      if (TransactionResult.validateResponse(response)) {
        const result = TransactionResult.fromResponse(response);

        const is_valid_payment = service.verifyPaymentHash(
          result.payment_hash,
          order.id,
          "b36aa20b0010f042b5bf788a4793b902"
        );

        if (is_valid_payment) {
          alert("Pago realizado con éxito");
        }
      }
    } catch (error) {
      console.error("Error al realizar el pago:", error);
      alert("Hubo un error al procesar el pago.");
    }
  };

  return (
    <div>
      <NavbarMenu />
      <main>
        <h1 className="text-2xl font-bold text-center my-6">Tu carrito</h1>

        <div className="p-4">
          {cart.length > 0 ? (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex items-center gap-4 border-b pb-4">
                  <Image
                    src={item.imagenes?.imagen_01 || "/default-product.png"}
                    alt={item.producto || "Producto"}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{item.producto}</h3>
                    <p className="text-gray-600">Cantidad: {item.quantity}</p>
                    <p className="text-gray-600">Precio: L {item.precio?.toFixed(2)}</p>
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

        <div className="flex justify-center mt-6">
          <button
            onClick={handlePayment}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Realizar Pago
          </button>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
