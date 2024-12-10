import React from 'react'

function Footer() {
  return (
    <footer className='w-full'>
      <section className='bg-black p-8 md:px-20 flex flex-col gap-6 sm:flex-col md:flex-row'>
        <div className='flex-1 flex flex-col gap-y-4'>
          <h4 className='text-white'>Suscribirse para recibir Ofertas y mas</h4>
          <div className='flex gap-x-3'>
            <input className='w-[350px] bg-[#2c2c2c] py-2 px-4 rounded-[4px] text-[14px]' placeholder='Introduce tu correo electronico...' type="email" name="correo" id="correo" />
            <button type="submit" className='bg-white text-current py-2 px-6 text-[14px]'>Suscríbete</button>
          </div>
        </div>

        <div className='flex-1 flex flex-col gap-y-4'>
          <h4 className='text-white'>Únete a la comunidad</h4>
          <div className='flex gap-x-8'>
            <img className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors' src="/images/social/facebook.svg" alt="cuenta de facebook tecpoint" height={24} width={24} />
            <img className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors' src="/images/social/instagram.svg" alt="cuenta de instagram tecpoint" height={24} width={24} />
            <img className='cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-colors' src="/images/social/tiktok.svg" alt="cuenta de tiktok tecpoint" height={30} width={30} />
          </div>
        </div>
      </section>

      <section>
      </section>
    </footer>
  )
}

export default Footer