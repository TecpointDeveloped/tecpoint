import { NextApiRequest, NextApiResponse } from "next";
import paypal from "@paypal/checkout-server-sdk";

// Handler para capturar un pedido
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { orderID } = req.body;

  if (!orderID) {
    return res.status(400).json({ error: "Falta el ID del pedido" });
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(503).json({
      error: "El pago en línea aún no está habilitado.",
    });
  }

  const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
  const paypalClient = new paypal.core.PayPalHttpClient(environment);
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
