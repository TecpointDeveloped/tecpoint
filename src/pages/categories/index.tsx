import Image from 'next/image'
import NavbarMenu from '@/components/navbarmenu/page'
import Head from 'next/head'
import Link from 'next/link'
import Footer from '@/components/Footer/page'

export async function getServerSideProps() {
  return {
    props: {
      title: 'Categorias | Tecpoint Distribucion',
      description: 'Explora todas nuestras categorias y marcas con la mejor calidad',
      keywords: 'audifonos, cables, cargadores, cobertores, parlantes, marcas, categorias',
      robots: 'index, follow',
    }
  }
}

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavbarMenu />

      <main className='flex flex-col w-full gap-4'>
        <section className='flex w-full flex-col gap-4'>
          <div className="w-full md:h-[75vh] bg-black relative flex flex-col justify-between">
            <div className="flex-1 grid place-content-center">
              <h4 className='md:text-4xl font-bold tracking-[-0.4px] text-white text-center'>Explorar la Experiencia Apple con todo lo <br /> nuevo de iPhone 16 series</h4>

            </div>

            <picture>
              <Image
                alt="Audifonos de alta calidad para todas tus necesidades de audio"
                quality={100}
                width={1400}
                height={800}
                src="https://www.macstation.com.ar/theme_macstation/static/src/img/banners/home-black.png"
                className="md:w-fit h-[250px] object-cover object-center m-auto"
              />
            </picture>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0 p-3">
          <div className="h-[500px] overflow-hidden cursor-pointer flex items-center justify-center md:h-[560px] bg-black relative group">
            <Image
              alt="Audifonos de alta calidad para todas tus necesidades de audio"
              quality={100}
              width={380}
              height={380}
              src="/images/categorias/productos/X0 AUDIFONOS Q5.png"
              className="object-cover object-center m-auto z-10 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 opacity-0 translate-y-10 group-hover:backdrop-blur-md group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h2 className="text-white text-[64px] tracking-[-3px] font-semibold">Auriculares</h2>
              <Link href="/shop?page=1&brand=&category=all&search=auriculares" className="text-white flex items-center md:text-[20px] hover:underline">
                Explorar
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="h-[500px] overflow-hidden cursor-pointer flex items-center justify-center md:h-[560px] bg-[#d2bfb8] relative group">
            <Image
              alt="Audifonos de alta calidad para todas tus necesidades de audio"
              quality={100}
              width={380}
              height={380}
              src="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FHypergear%2FHG-15860%2FHG-15860_01?alt=media&token=e61a72f8-9df8-4ce7-91e4-d96f2b4bc973"
              className="object-cover object-center m-auto z-10 group-hover:scale-125 group-hover:rotate-[10deg] transition-all duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 opacity-0 translate-y-10 group-hover:backdrop-blur-md group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h2 className="text-black text-[64px] tracking-[-3px] font-semibold">Audifonos BT</h2>
              <Link href="/shop?page=1&brand=&category=all&search=audifonos" className="text-black flex items-center md:text-[20px] hover:underline">
                Explorar
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="h-[500px] overflow-hidden cursor-pointer flex items-center justify-center md:h-[560px] bg-[#ff5e00] relative group">
            <Image
              alt="Audifonos de alta calidad para todas tus necesidades de audio"
              quality={100}
              width={560}
              height={560}
              src="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FHypergear%2FHG-15785%2FFrame%20364.png_1?alt=media&token=c941567c-e1aa-423a-9753-d6236b80d5ea"
              className="object-cover object-center m-auto z-10 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 opacity-0 translate-y-10 group-hover:backdrop-blur-md group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h2 className="text-white text-[64px] tracking-[-3px] font-semibold">Car Charger</h2>
              <Link href="/shop?page=1&brand=&category=all&search=auriculares" className="text-white flex items-center md:text-[20px] hover:underline">
                Explorar
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="h-[500px] overflow-hidden cursor-pointer flex items-center justify-center md:h-[560px] bg-[#195eff] relative group">
            <Image
              alt="Audifonos de alta calidad para todas tus necesidades de audio"
              quality={100}
              width={480}
              height={480}
              src="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/productos%2FHypergear%2FHG-15827%2F15827_01%201.png_1?alt=media&token=862363e6-e11b-4b60-a2ba-1c461bb3f3e5"
              className="object-cover object-center m-auto z-10 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-50 opacity-0 translate-y-10 group-hover:backdrop-blur-md group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              <h2 className="text-white text-[64px] tracking-[-3px] font-semibold">Power Banks</h2>
              <Link href="/shop?page=1&brand=&category=all&search=audifonos" className="text-white flex items-center md:text-[20px] hover:underline">
                Explorar
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default Categories