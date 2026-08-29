import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { collection, getDocs } from "firebase/firestore";
import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";
import { db } from "@/database/Config";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { approvedCatalogProducts, enrichProduct, getCurrentInventory, preferredProductSlug, publicCatalog } from "@/lib/catalog";
import styles from "@/styles/collectionLanding.module.css";
import type { Product } from "@/types/ProductTypes";

type CommercialCollection={name:string;slug:string;description:string;heroImageUrl:string;productSkus:string[];keywords:string[];active:boolean;archived:boolean;startsAt:string|null;endsAt:string|null};
type Props={campaign:CommercialCollection;products:Product[]};

const CHILDRENS_DAY:CommercialCollection={name:"Día del Niño",slug:"dia-del-nino",description:"Tecnología y accesorios para celebrar, aprender, jugar y compartir.",heroImageUrl:"",productSkus:[],keywords:["audifono","auricular","parlante","gaming","smartwatch","tablet","juego"],active:true,archived:false,startsAt:null,endsAt:null};
const plain=(value:unknown)=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const image=(product:Product)=>product.imagenes?.imagen_01?.img||Object.values(product.imagenes||{})[0]?.img||"/default-product.png";
const price=(product:Product)=>new Intl.NumberFormat("es-HN",{style:"currency",currency:"HNL",maximumFractionDigits:0}).format(Number(product.precio?.detalle||0));

export const getServerSideProps:GetServerSideProps<Props>=async({params})=>{
  const slug=String(params?.slug||"");
  try{
    const admin=getFirebaseAdmin();
    const snapshot=admin?await admin.db.collection("site_collections").doc(slug).get():null;
    const data=snapshot?.exists?snapshot.data():slug==="dia-del-nino"?CHILDRENS_DAY:null;
    if(!data)return{notFound:true};
    const campaign:CommercialCollection={
      name:String(data.name||""),slug:String(data.slug||slug),description:String(data.description||""),heroImageUrl:String(data.heroImageUrl||""),
      productSkus:Array.isArray(data.productSkus)?data.productSkus.map(String):[],keywords:Array.isArray(data.keywords)?data.keywords.map(String):[],
      active:data.active!==false,archived:data.archived===true,startsAt:data.startsAt?.toDate?.().toISOString?.()||data.startsAt||null,endsAt:data.endsAt?.toDate?.().toISOString?.()||data.endsAt||null,
    };
    const now=Date.now();
    if(!campaign.active||campaign.archived||(campaign.startsAt&&new Date(campaign.startsAt).getTime()>now)||(campaign.endsAt&&new Date(campaign.endsAt).getTime()<now))return{notFound:true};
    const databaseName=process.env.NEXT_PUBLIC_DATABASE_NAME;
    const productsSnapshot=databaseName?await getDocs(collection(db,databaseName)):null;
    const all=productsSnapshot?publicCatalog([...productsSnapshot.docs.map(item=>{const value=item.data();return enrichProduct({id:item.id,...value,fecha_agregado:value.fecha_agregado?.toDate?.().toISOString()||null} as Product);}),...approvedCatalogProducts()]):[];
    const skus=new Set(campaign.productSkus.map(plain));
    const keywords=campaign.keywords.map(plain).filter(Boolean);
    const products=all.filter(product=>Boolean(getCurrentInventory(product.sku))&&product.extradata?.stock===true).filter(product=>{
      if(skus.size)return skus.has(plain(product.sku));
      const haystack=plain([product.producto,product.descripcion,product.marca_producto?.marca,...(product.categorias||[]),product.Subcategorias,product.sku,...(Array.isArray(product.extradata?.tags)?product.extradata.tags:[])].join(" "));
      return keywords.some(keyword=>haystack.includes(keyword));
    }).slice(0,24);
    return{props:{campaign,products}};
  }catch(error){console.error("No se pudo cargar la colección comercial",error);if(slug!=="dia-del-nino")return{notFound:true};return{props:{campaign:CHILDRENS_DAY,products:[]}};}
};

export default function CollectionLanding({campaign,products}:Props){
  const canonical=`https://tecpoint.ws/colecciones/${campaign.slug}`;
  return <><Head><title>{campaign.name} | TECPOINT</title><meta name="description" content={campaign.description}/><meta name="robots" content="index,follow"/><link rel="canonical" href={canonical}/><meta property="og:title" content={`${campaign.name} | TECPOINT`}/><meta property="og:description" content={campaign.description}/>{campaign.heroImageUrl&&<meta property="og:image" content={campaign.heroImageUrl}/>}</Head><NavbarMenu/><main className={styles.page}>
    <section className={styles.hero}><div className={styles.copy}><p>COLECCIÓN ESPECIAL</p><h1>{campaign.name}</h1><h2>Accesorios para celebrar a lo grande.</h2><span>{campaign.description}</span><a href="#productos">Explorar selección</a></div><div className={styles.visual}>{campaign.heroImageUrl?<Image src={campaign.heroImageUrl} alt={`Colección ${campaign.name}`} fill priority sizes="(max-width: 800px) 100vw, 48vw"/>:<><Image src="/brand/isologo.svg" alt="" width={220} height={220} priority/><b>TECPOINT</b></>}</div></section>
    <section id="productos" className={styles.products}><header><div><p>SELECCIÓN TECPOINT</p><h2>Regalos que conectan con su mundo.</h2></div><Link href="/shop">Ver toda la tienda →</Link></header>{products.length?<div className={styles.grid}>{products.map(product=><Link href={`/shop/${preferredProductSlug(product)}`} className={styles.card} key={product.id}><div><Image src={image(product)} alt={product.producto} width={520} height={520} sizes="(max-width: 760px) 90vw, 24vw"/></div><small>{product.marca_producto?.marca||"TECPOINT"}</small><h3>{product.producto}</h3><strong>{price(product)}</strong><span>Ver producto →</span></Link>)}</div>:<div className={styles.empty}><h3>Estamos preparando esta selección.</h3><p>Muy pronto encontrará aquí los productos disponibles para {campaign.name}.</p><Link href="/shop">Explorar el catálogo</Link></div>}</section>
  </main><Footer/></>;
}
