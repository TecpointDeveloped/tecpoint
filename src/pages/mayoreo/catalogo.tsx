import dynamic from 'next/dynamic';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { livePopularWholesaleProducts, liveWholesaleCatalog } from '@/lib/wholesaleCatalog.server';
import { prepareCatalog } from '@/lib/wholesale-ui/prepareCatalog';
import type { PackedCatalog } from '@/lib/wholesale-ui/catalogData';
const CatalogApp = dynamic(() => import('@/components/wholesale-ui/CatalogApp'), { ssr: false, loading: () => <p style={{padding:32}}>Cargando catálogo mayorista…</p> });
export default function CatalogPage({ catalog, popularSkus }: { catalog: PackedCatalog; popularSkus: string[] }) {
  return <><Head><title>TECPOINT · Catálogo mayorista</title><meta name="description" content="Encuentra accesorios compatibles, compara precios y prepara tu pedido mayorista TECPOINT." /></Head><CatalogApp catalog={catalog} popularSkus={popularSkus} /></>;
}
export const getServerSideProps: GetServerSideProps = async ({res}) => {
  res.setHeader('Cache-Control', 'private, no-store');
  const products = await liveWholesaleCatalog();
  const popularProducts = await livePopularWholesaleProducts(products);
  return { props: { catalog: prepareCatalog(products), popularSkus: popularProducts.map(product => product.sku) } };
};
