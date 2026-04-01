import Footer from "@/components/Footer/page";
import NavbarMenu from "@/components/navbarmenu/page";

const PreguntasFrecuentes = () => {
  return (
    <>
      <NavbarMenu />

      <main className="p-4 mt-[70px]">
        <div className="box">
          <h1>Preguntas frecuentes</h1>
          <div className="box">
            <h2>¿OFRECEN ENVIO GRATIS?</h2>
            <p>Sí, los pedidos de LPS. 1,500.00 o más califican para el envío gratuito en el casco urbano de San Pedro Sula.</p>
          </div>
          <div className="box">
            <h2>¿RECIBÍ UN PRODUCTO DEFECTUOSO, ¿CÓMO HAGO PARA OBTENER UN REEMPLAZO?</h2>
            <p>TECPOINT ofrece productos de calidad, por lo tanto, ofrecemos garantías en todos nuestros productos. Favor leer nuestras políticas de aceptación de garantía.</p>
          </div>
          <div className="box">
            <h2>EN CASO DE QUE MI PANTALLA SE ROMPA MIENTRAS USO UNO DE SUS COBERTORES O UN VIDRIO TEMPLADO, ¿EXISTE ALGUNA GARANTÍA O SEGURO PARA CUBRIR MI DISPOSITIVO?</h2>
            <p>Nuestra garantía solo se aplica a los productos, no al dispositivo.</p>
          </div>
          <div className="box">
            <h2>¡PEDÍ EL ARTÍCULO EQUIVOCADO! ¿PUEDO CANCELAR MI PEDIDO?</h2>
            <p>Estaremos encantados de realizar cualquier cambio en su pedido si se comunica con nosotros dentro de las 2 horas posteriores a la realización de su pedido. Atendiendo de lunes a viernes de 8:00 am a 5:00 p.m. y sábado de 9:00 am a 1:00 p.m.</p>
          </div>
          <div className="box">
            <h2>¿CUÁNTO TIEMPO TARDARÁ EN LLEGAR MI PEDIDO?</h2>
            <p>La mayoría de los pedidos se procesan y envían dentro de 1 a 3 días hábiles a partir de la fecha del pedido. Atendiendo de lunes a viernes de 8:00 am a 5:00 p.m.</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PreguntasFrecuentes;
