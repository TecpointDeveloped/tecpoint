import { NextApiRequest, NextApiResponse } from "next";
import paypal from "@paypal/checkout-server-sdk";

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID || "AWLXP5vCA1FjayLx8uiKQK_tqCIYX8JASMsGyc5Jw2NCuTxtWjJG89GJgfIsW2j6B-G7aIteNuF71Y-m",
  process.env.PAYPAL_CLIENT_SECRET || "EP7JoqAt8D-Bqk5BVz5IVuMCPUhUXaxEYED-h8lWFadQFSlgRehIUZsE9l69b18XPXumoIQxe-A39mwP"
);

const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Handler para capturar un pedido
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ error: "Falta el ID del pedido" });
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const response = await paypalClient.execute(request);

    return res.status(200).json({ details: response.result });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al capturar el pedido:", error.message);
      return res.status(500).json({ error: "Error al capturar el pedido", details: error.message });
    } else {
      console.error("Error inesperado:", error);
      return res.status(500).json({ error: "Error inesperado al capturar el pedido" });
    }
  }
}