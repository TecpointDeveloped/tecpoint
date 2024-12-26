import Image from "next/image"
import Link from "next/link"

function Footer() {
  return (
    <footer className='w-full'>
      <section className='bg-black p-6 md:px-8 sm:px-4 flex flex-col sm:flex-row md:flex-row lg:flex-row gap-6 md:justify-between'>
        <div className='flex-1 flex flex-col gap-y-4'>
          <h4 className='text-white'>Suscribirse para recibir Ofertas y mas</h4>
          <div className='flex flex-col gap-3'>
            <input className='w-full md:w-[350px] bg-[#2c2c2c] py-2 px-4 rounded-[4px] text-[14px]' placeholder='Introduce tu correo electronico...' type="email" name="correo" id="correo" />
            <button type="submit" className='bg-white w-fit text-current py-2 px-6 text-[14px]'>Suscríbete</button>
          </div>
        </div>

        <div className='md:flex-1 md:w-fit flex flex-col gap-y-4'>
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
        </div>
      </section>

      <section>
      </section>
    </footer>
  )
}

export default Footer