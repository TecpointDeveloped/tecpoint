import type { GetServerSideProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/database/Config";
import {
  getCurrentInventory,
  publicCatalog,
  preferredProductSlug,
} from "@/lib/catalog";
import { Product } from "@/types/ProductTypes";

const BASE_URL = "https://tecpoint.ws";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const staticUrls = [
    { loc: BASE_URL, priority: "1.0", frequency: "daily" },
    { loc: `${BASE_URL}/shop`, priority: "0.9", frequency: "daily" },
    { loc: `${BASE_URL}/categories`, priority: "0.8", frequency: "weekly" },
    { loc: `${BASE_URL}/blog`, priority: "0.7", frequency: "weekly" },
    { loc: `${BASE_URL}/garantia`, priority: "0.6", frequency: "monthly" },
    { loc: `${BASE_URL}/preguntas-frecuentes`, priority: "0.6", frequency: "monthly" },
    { loc: `${BASE_URL}/politica-privacidad`, priority: "0.3", frequency: "yearly" },
    { loc: `${BASE_URL}/terminos-y-condiciones`, priority: "0.3", frequency: "yearly" },
  ];

  let productUrls: Array<{
    loc: string;
    priority: string;
    frequency: string;
  }> = [];

  try {
    const databaseName = process.env.NEXT_PUBLIC_DATABASE_NAME;
    if (databaseName) {
      const snapshot = await getDocs(collection(db, databaseName));
      productUrls = publicCatalog(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as Product[],
      )
        .filter((product) => Boolean(getCurrentInventory(product.sku)))
        .map((item) => preferredProductSlug(item))
        .filter((slug): slug is string => Boolean(slug))
        .map((slug) => ({
          loc: `${BASE_URL}/shop/${encodeURIComponent(slug)}`,
          priority: "0.8",
          frequency: "weekly",
        }));
    }
  } catch (error) {
    console.error("No se pudo actualizar el sitemap de productos:", error);
  }

  const urls = [...staticUrls, ...productUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <changefreq>${url.frequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
