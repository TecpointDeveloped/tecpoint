import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";
import Head from 'next/head';

const Garantia = () => {
  return (
    <>
      <Head>
        <title>Politica de Garantia</title>
        <meta name="description" content="Tecpoint garantiza que todos los productos comprados estarán libres de defectos relacionados con la calidad en los materiales cuando el producto se utilice para el propósito previsto en condiciones normales durante el período indicado en cada producto." />
        <meta name="keywords" content="TECPOINT, garantía, productos, calidad, servicio al cliente" />
        <meta name="author" content="TECPOINT" />
        <meta property="og:title" content="Politica de Garantia" />
        <meta property="og:description" content="Información sobre la garantía de los productos de TECPOINT." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.tecpoint.com/garantia" />
        <meta property="og:site_name" content="TECPOINT" />
      </Head>

      <NavbarMenu />

      <main className="p-4 w-full md:w-[90%] m-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center">Garantia</h1>

        <p className="mb-2">El cliente puede optar a cambio de su producto por las siguientes condiciones:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Sin existencia en Inventario</li>
          <li>Producto incompleto</li>
          <li>Producto en Garantía</li>
        </ul>
        <p className="mb-2">
          TECPOINT garantiza que todos los productos comprados estarán libres de defectos relacionados con la calidad en los materiales cuando el producto se utilice para el propósito previsto en condiciones normales durante el período indicado en cada producto.
        </p>
        <p className="mb-2">
          Esta garantía está restringida al comprador original con un comprobante de compra válido. El comprobante de compra será enviado al cliente vía correo electrónico, el cliente puede solicitar físicamente dicho comprobante, el cual le será enviado junto con la mercadería.
        </p>
        <p className="mb-2">
          Esta garantía no se aplica a los daños incurridos como resultado del desgaste por el uso normal a lo largo del tiempo, daños accidentales, cuidado inadecuado, modificaciones, desmontaje o alteraciones del producto, uso indebido y abuso, u operación incorrecta.
        </p>
        <p className="mb-2">
          La cobertura de la garantía no cubre, bajo ninguna circunstancia, daños a personas o bienes personales adjuntos o utilizados junto con el producto TECPOINT.
        </p>
        <p className="mb-2">
          El articulo debe tener su respectiva etiqueta original, empaques, caja y accesorios en perfecto estado. La unidad debe de igual forma estar intacta sin golpes ni rayones.
        </p>
        <p className="mb-2">
          La garantía en todos nuestros productos electrónicos es de 90 días sobre desperfectos de fábrica únicamente. Todo producto electrónico tiene que ser sometido a una revisión técnica para dictaminar el fallo si es de fábrica o mal uso por parte del cliente.
        </p>
        <p className="mb-2">
          En caso de que el cliente reciba credito por cualquier producto, el credito sera solo por el valor de los productos.
        </p>
        <p className="mb-2">
          Todo producto en garantía debe de enviarse o llevarse personalmente a la Tienda de TECPOINT San Pedro Sula. El cliente deberá correr con los gastos de envío si éste no puede llevarlo a la Tienda San Pedro Sula.
        </p>
      </main>

      <Footer />
    </>
  );
};

export default Garantia;