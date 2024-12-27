import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const response = await fetch("https://pixel-pay.com/api/v2/transaction/sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || "Error en la solicitud de pago" });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error al procesar la solicitud de pago:", error);
      // Si algo sale mal, responde con error 500
      return res.status(500).json({ error: "Error al procesar la solicitud de pago" });
    }
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}