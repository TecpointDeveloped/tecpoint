import NavbarMenu from '@/components/navbarmenu/page'
import Head from 'next/head'
import Link from 'next/link'
import Footer from '@/components/Footer/page'
import Image from 'next/image'

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
    label: 'Power & Charge',
    sub: 'Cargadores, power banks y soluciones de energía',
    image: '/images/categorias/minis/POWER & CHARGE.png',
    bg: 'bg-[#ff5e00]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=carga',
  },
  {
    label: 'Screen Protection',
    sub: 'Protectores de pantalla y cristales templados',
    image: '/images/categorias/minis/Screen Protection_.png',
    bg: 'bg-[#1a1a2e]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=vidrio',
  },
  {
    label: 'Sound Essentials',
    sub: 'Audífonos, speakers y equipos de audio',
    image: '/images/categorias/minis/Sound Essentials.png',
    bg: 'bg-[#d2bfb8]',
    textColor: 'text-black',
    href: '/shop?page=1&brand=&search=audio',
  },
  {
    label: 'Smart Tech',
    sub: 'Smartwatch, wearables y dispositivos inteligentes',
    image: '/images/categorias/minis/Smart Tech.png',
    bg: 'bg-[#16213e]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=smartwatch',
  },
  {
    label: 'Travel & Carry',
    sub: 'Mochilas, estuches y organizadores portátiles',
    image: '/images/categorias/minis/Travel & Carry.png',
    bg: 'bg-[#2d2d2d]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=mochila',
  },
  {
    label: 'Smart Drive',
    sub: 'Accesorios para vehículos y conectividad vehicular',
    image: '/images/categorias/minis/Smart Drive.png',
    bg: 'bg-[#1c1c1e]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=carro',
  },
  {
    label: 'Outdoor Pro',
    sub: 'Equipos para exterior, iluminación y herramientas',
    image: '/images/categorias/minis/Outdoor Pro.png',
    bg: 'bg-[#0f3460]',
    textColor: 'text-white',
    href: '/shop?page=1&brand=&search=outdoor',
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`group relative overflow-hidden rounded-2xl ${cat.bg} h-[340px] md:h-[420px] flex flex-col justify-between p-8`}
              >
                {/* Imagen con blur frente a la card */}
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-contain absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity pointer-events-none"
                    quality={100}
                  />
                )}

                {/* Texto siempre visible */}
                <div className="flex flex-col gap-1 z-10 relative">
                  <p className={`text-sm font-medium opacity-60 ${cat.textColor}`}>{cat.sub}</p>
                  <h2 className={`text-4xl md:text-5xl font-black tracking-tight leading-none ${cat.textColor}`}>
                    {cat.label}
                  </h2>
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
