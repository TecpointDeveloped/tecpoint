import Image from "next/image"
import Link from "next/link"
import { Separator } from "../ui/separator"

function Footer() {
  return (
    <footer className='bg-[#010101] w-full h-fit flex flex-col gap-y-6 py-10 px-4 md:px-8'>
      <section className='flex flex-col m-auto lg:m-0 lg:flex-row gap-6 md:justify-between'>
        <h4 className="text-white text-start  text-2xl flex flex-col tracking-[-0.2px]">Distribuidores de marcas y accesorios <span className="block">Tecnologicios a nivel Nacional</span></h4>

        <form className='flex gap-3' onSubmit={(e) => e.preventDefault()}>
          <input className='w-full h-10 md:w-[350px] bg-[#2c2c2c] text-white py-2 px-6 rounded-full text-[14px]' placeholder='Introduce tu correo electronico...' type="email" name="correo" id="correo" />
          <button type="submit" className='bg-white w-fit text-current py-2 px-6 text-[14px] h-10 rounded-full'>Suscríbete</button>
        </form>
      </section>

      <Separator className="mt-8" />

      <section className='md:flex-1 md:w-fit flex flex-col gap-y-4'>
        <h4 className='text-white'>Únete a la comunidad</h4>
        <div className='flex gap-x-8'>
          <Link href='https://www.facebook.com/Tecpoint.Distribucion/'>
            <Image
              className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors'
              src="/images/social/facebook.svg"
              alt="cuenta de facebook tecpoint"
              height={24}
              width={24}
            />
          </Link>

          <Link href='https://www.instagram.com/tecpoint_distribucion/'>
            <Image
              className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors'
              src="/images/social/instagram.svg"
              alt="cuenta de instagram tecpoint"
              height={24}
              width={24}
            />
          </Link>

          <Link href='https://www.tiktok.com/@tecpoint.ws'>
            <Image
              className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors'
              src="/images/social/tiktok.svg"
              alt="cuenta de tiktok tecpoint"
              height={30}
              width={30}
            />
          </Link>

          <Link href='https://www.tiktok.com/@tecpoint.ws'>
            <Image
              className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors'
              src="/images/social/whatsapp.svg"
              alt="cuenta de whatsapp tecpoint"
              height={30}
              width={30}
            />
          </Link>
        </div>
      </section>
    </footer>
  )
}

export default Footer