import Image from 'next/image'
import NavbarMenu from '@/components/navbarmenu/page'
import Head from 'next/head'
import Link from 'next/link'

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

      <main className='flex w-full gap-6'>
        <section className="w-full h-fit py-12 flex p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 m-auto place-items-center">

            <Link href="/shop?page=1&brand=&search=audifonos" className='flex flex-col items-center gap-y-2'>
              <h3 className='text-[18px] font-semibold'>Audifonos</h3>
              <Image
                alt="Audifonos de alta calidad para todas tus necesidades de audio"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/audifonos__categoria.png"
                className="aspect-square object-contain"
              />
            </Link>

            <Link href="/shop?page=1&brand=&search=Auriculares" className="flex flex-col items-center gap-y-2">
              <h2 className='text-[18px] font-semibold'>Auriculares</h2>
              <Image
                alt="Auriculares cómodos y duraderos para uso diario"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/auriculares__categoria.png"
                className="aspect-square object-contain"
              />
            </Link>

            <Link href="/shop?page=1&brand=&search=cable" className="flex flex-col items-center gap-y-2">
              <h3 className='text-[18px] font-semibold'>Cables</h3>
              <Image
                alt="Cables resistentes y de alta velocidad para todos tus dispositivos"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/cables__categoria.png"
                className="aspect-square object-contain"
              />
            </Link>

            <span className="flex flex-col items-center gap-y-2">
              <h3 className='text-[18px] font-semibold'>Cargadores</h3>
              <Image
                alt="Cargadores rápidos y eficientes para mantener tus dispositivos siempre encendidos"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/cargadores__categoria.png"
                className="aspect-square object-contain"
              />
            </span>

            <span className="flex flex-col items-center gap-y-2">
              <h3 className='text-[18px] font-semibold'>Cobertores</h3>
              <Image
                alt="Cobertores protectores para mantener tus dispositivos seguros"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/cobertores_categoria.png"
                className="aspect-square object-contain"
              />
            </span>

            <span className="flex flex-col items-center gap-y-2">
              <h3 className='text-[18px] font-semibold'>Audio</h3>
              <Image
                alt="Parlantes de alta fidelidad para una experiencia de audio superior"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/parlantes_categoria.png"
                className="aspect-square object-contain"
              />
            </span>

          </div>
        </section>
      </main>
    </>
  )
}

export default Categories