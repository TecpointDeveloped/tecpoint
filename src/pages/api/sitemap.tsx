import { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/Config';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const baseUrl = "https://tecpoint.ws";
  const productCollection = collection(db, 'Products');

  try {
    const snapshot = await getDocs(productCollection);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    snapshot.forEach((doc) => {
      const productUrl = `${baseUrl}/producto/${doc.id}`;
      sitemap += `
        <url>
          <loc>${productUrl}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `;
    });

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).json({ error: "Error generating sitemap" });
  }
};

export default handler;