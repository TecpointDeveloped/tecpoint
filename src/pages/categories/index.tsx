import Image from 'next/image'
import NavbarMenu from '@/components/navbarmenu/page'
import Head from 'next/head'
import Link from 'next/link'
import Footer from '@/components/Footer/page'

export async function getServerSideProps() {
  return {
    props: {
      title: 'Categorías | Accesorios Tecnológicos | Tecpoint Honduras',
      description: 'Explora nuestras categorías: audífonos, cables, cargadores, cobertores, power banks, smartwatch. Envío 24-48h, pago al recibir.',
      keywords: 'categorías accesorios tecnológicos, audífonos, cables USB-C, cargadores rápidos, cobertores iPhone, power banks, smartwatch, Honduras',
      robots: 'index, follow',
    }
  }
}

const categories = [
  {
    label: 'Auriculares',
    sub: 'True Wireless & con cable',
    bg: 'bg-black',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=auriculares',
    image: '/images/categorias/productos/X0 AUDIFONOS Q5.png',
    imgSize: 320,
  },
  {
    label: 'Audifonos BT',
    sub: 'Bluetooth & Over-ear',
    bg: 'bg-[#d2bfb8]',
    textColor: 'text-black',
    href: '/shop?page=1&brand=&search=audifonos',
    image: 'https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FHypergear%2FHG-15860%2FHG-15860_01?alt=media&token=e61a72f8-9df8-4ce7-91e4-d96f2b4bc973',
    imgSize: 340,
  },
  {
    label: 'Car Charger',
    sub: 'Carga rápida para tu vehículo',
    bg: 'bg-[#ff5e00]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=cargador+carro',
    image: 'https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FHypergear%2FHG-15785%2FFrame%20364.png_1?alt=media&token=c941567c-e1aa-423a-9753-d6236b80d5ea',
    imgSize: 480,
  },
  {
    label: 'Power Banks',
    sub: 'Batería portátil de alta capacidad',
    bg: 'bg-[#195eff]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=power+bank',
    image: 'https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FHypergear%2FHG-15827%2F15827_01%201.png_1?alt=media&token=862363e6-e11b-4b60-a2ba-1c461bb3f3e5',
    imgSize: 400,
  },
  {
    label: 'Cobertores',
    sub: 'Protección para tu dispositivo',
    bg: 'bg-[#1c1c1e]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=cobertor',
    image: 'https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FGhostek%2FGHOCAS3605%2Fcobertor%20ghostek%20iPhone%2015%20Pro%20Max%20Gray.webp?alt=media&token=35e65c15-fcd3-4fa3-8957-86e0c30a63ac',
    imgSize: 280,
  },
  {
    label: 'Cables',
    sub: 'USB-C, Lightning, HDMI y más',
    bg: 'bg-[#2c3e50]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=cable',
    image: 'https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FAppacs%2FEL-10113%2FABUIABACGAAglZ27igYozNXO5AYwhAc4hAc.jpg_1?alt=media&token=067f2c71-180c-4f6d-871e-4f951a9bce69',
    imgSize: 300,
  },
  {
    label: 'Accesorios',
    sub: 'Todo lo que tu equipo necesita',
    bg: 'bg-[#f5f5f0]',
    textColor: 'text-black',
    href: '/shop?page=1&brand=&search=accesorios',
    image: '/images/categorias/minis/cargadores__categoria.png',
    imgSize: 260,
  },
]

function Categories({ title, description, keywords, robots }: { title: string, description: string, keywords: string, robots: string }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content={robots} />
        <meta name="author" content="Tecpoint Distribucion" />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tecpoint.ws/categories" />
        <meta property="og:description" content={description} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <NavbarMenu />

      <main className="flex flex-col w-full">

        {/* Hero */}
        <section className="w-full bg-black flex flex-col items-center justify-center text-center py-20 px-6 gap-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Tecpoint — Catálogo</p>
          <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tight leading-tight max-w-2xl">
            Explora todo lo que <span className="text-[#CCFD03]">tenemos para ti</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
            Accesorios tecnológicos de las mejores marcas, al mayor y al detalle.
          </p>
          <Link
            href="/shop?page=1&brand=&search="
            className="mt-2 bg-[#CCFD03] text-black font-semibold py-3 px-8 rounded-full hover:bg-white transition-colors"
          >
            Ver todos los productos
          </Link>
        </section>

        {/* Grid de categorías */}
        <section className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`group relative overflow-hidden rounded-2xl ${cat.bg} h-[340px] md:h-[420px] flex flex-col justify-between p-8`}
              >
                {/* Texto siempre visible */}
                <div className="flex flex-col gap-1 z-10 relative">
                  <p className={`text-sm font-medium opacity-60 ${cat.textColor}`}>{cat.sub}</p>
                  <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${cat.textColor}`}>
                    {cat.label}
                  </h2>
                </div>

                {/* Imagen centrada */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    alt={cat.label}
                    quality={100}
                    width={cat.imgSize}
                    height={cat.imgSize}
                    src={cat.image}
                    className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* CTA siempre visible abajo */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`text-sm font-semibold flex items-center gap-1 ${cat.textColor} opacity-80 group-hover:opacity-100 group-hover:gap-2 transition-all`}>
                    Explorar
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </span>

                  <span className={`text-xs px-3 py-1 rounded-full border ${cat.textColor} border-current opacity-40 group-hover:opacity-70 transition-opacity`}>
                    Ver colección
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}

export default Categories
