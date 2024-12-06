import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch("https://ficoposonline.com/api/v2/transaction/sale", {
    method: req.method,
    headers: {
      ...req.headers,
      "Content-Type": "application/json",
    },
    body: req.body,
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
