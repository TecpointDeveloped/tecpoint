import Image from 'next/image'
import NavbarMenu from '@/components/navbarmenu/page'

function Categories() {
  return (
    <div>
      <NavbarMenu />

      <main className='flex w-full gap-6'>
        <section className="w-full h-fit py-12 flex p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 m-auto place-items-center">
            <span className='flex flex-col items-center gap-y-2'>
              <h2 className='text-[18px] font-semibold'>Audifonos</h2>
              <Image
                alt="audifonos__categoria"
                quality={100}
                width={140}
                height={140}
                src="/images/categorias/minis/audifonos__categoria.png"
                className="aspect-square object-contain"
              />
            </span>

            <Image
              alt="audifonos__categoria"
              quality={100}
              width={140}
              height={140}
              src="/images/categorias/minis/auriculares__categoria.png"
              className="aspect-square object-contain"
            />

            <Image
              alt="audifonos__categoria"
              quality={100}
              width={140}
              height={140}
              src="/images/categorias/minis/cables__categoria.png"
              className="aspect-square object-contain"
            />

            <Image
              alt="audifonos__categoria"
              quality={100}
              width={140}
              height={140}
              src="/images/categorias/minis/cargadores__categoria.png"
              className="aspect-square object-contain"
            />

            <Image
              alt="audifonos__categoria"
              quality={100}
              width={140}
              height={140}
              src="/images/categorias/minis/cobertores_categoria.png"
              className="aspect-square object-contain"
            />

            <Image
              alt="audifonos__categoria"
              quality={100}
              width={140}
              height={140}
              src="/images/categorias/minis/parlantes_categoria.png"
              className="aspect-square object-contain"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

export default Categories