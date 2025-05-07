import NavbarMenu from '@/components/navbarmenu/page'
import React from 'react'

function index() {
  return (
    <>
      <NavbarMenu />

      <div className='p-8 max-w-xl mx-auto bg-white shadow-md rounded-lg'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Checkout</h2>

        <form className='space-y-4'>



          <section className='flex gap-4'>
            <div className='w-full'>
              <label htmlFor="firstName" className='block text-sm font-medium text-gray-700'>Nombres del Cliente:</label>
              <input type="text" id="firstName" name="firstName" required className='mt-1 block w-full flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
            </div>

            <div className='w-full'>
              <label htmlFor="lastName" className='block text-sm font-medium text-gray-700'>Apellidos del Cliente:</label>
              <input type="text" id="lastName" name="lastName" required className='mt-1 block w-full flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
            </div>
          </section>

          <section className='flex gap-4'>
            <div className='w-full gap-4'>
              <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Correo Electrónico:</label>
              <input type="email" id="email" name="email" required className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
            </div>

            <div className='w-[280px] gap-4'>
              <label htmlFor="phone" className='block text-sm font-medium text-gray-700'>Número de Teléfono:</label>
              <input type="tel" id="phone" name="phone" required className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
            </div>
          </section>

          <div>
            <label htmlFor="address" className='block text-sm font-medium text-gray-700'>Dirección Completa:</label>
            <input type="text" id="address" name="address" required className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
          </div>
          <div>
            <label htmlFor="cardNumber" className='block text-sm font-medium text-gray-700'>Número de Tarjeta:</label>
            <input type="text" id="cardNumber" name="cardNumber" required className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' />
          </div>
          <div>
            <label htmlFor="notes" className='block text-sm font-medium text-gray-700'>Notas del Pedido:</label>
            <textarea id="notes" name="notes" className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'></textarea>
          </div>
          <button type="submit" className='w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>Enviar</button>
        </form>
      </div>
    </>
  )
}

export default index