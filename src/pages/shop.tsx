import NavbarMenu from '@/components/navbarmenu/page'
import Head from 'next/head'
import React from 'react'

function shop() {
  return (
    <div>
      <NavbarMenu />

      <Head>
        <title>Tienda Tecpoint | Todo en accesorios Tecnológicos</title>
        <meta
          name="description"
          content="Descubre nuestra tienda online con lo último en accesorios tecnológicos de la mejor calidad."
        />
        <meta
          property="og:title"
          content="Tienda Tecpoint | Todo en accesorios Tecnológicos"
        />
        <meta
          property="og:description"
          content="Descubre nuestra tienda online con lo último en accesorios tecnológicos de la mejor calidad."
        />
        <meta property="og:url" content="https://tecpoint.ws./shop" />
        <meta property="og:image" content="/og-image.png" />
      </Head>

      shop
    </div>
  )
}

export default shop