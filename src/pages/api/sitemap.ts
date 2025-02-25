// generateSitemap.ts
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../database/Config'; // Ajusta la ruta a tu configuración de Firebase
import fs from 'fs';
import path from 'path';

async function generateSitemap() {
  const baseUrl = "https://tecpoint.ws";
  const productCollection = collection(db, 'Products');

  try {
    const snapshot = await getDocs(productCollection);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    snapshot.forEach((doc) => {
      const productUrl = `${baseUrl}/shop/${doc.data().slug}`;
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

    // Guarda el sitemap en public/sitemap.xml
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log("Sitemap generado correctamente en public/sitemap.xml");

  } catch (error) {
    console.error("Error generando el sitemap:", error);
  }
}

// Ejecuta el script
generateSitemap();
