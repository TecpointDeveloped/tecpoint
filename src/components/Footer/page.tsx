import Image from "next/image";
import Link from "next/link";
import { Separator } from "../ui/separator";

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] w-full h-fit flex flex-col gap-y-10 py-12 px-6 md:px-12">
      <section className="flex flex-col m-auto lg:m-0 lg:flex-row gap-8 md:justify-between items-center">
        <h4 className="text-white text-center lg:text-start text-2xl font-semibold tracking-wide">
          Distribuidores de marcas y accesorios{" "}
          <span className="block">Tecnológicos a nivel Nacional</span>
        </h4>

        <form
          className="flex flex-col sm:flex-row gap-4 items-center"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="w-full h-12 md:w-[400px] bg-[#1c1c1c] text-white py-3 px-6 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Introduce tu correo electrónico..."
            type="email"
            name="correo"
            id="correo"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-3 px-8 text-sm h-12 rounded-full hover:bg-blue-600 transition-colors"
          >
            Suscríbete
          </button>
        </form>
      </section>

      <Separator className="mt-8 border-gray-700" />

      <section className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-col gap-y-6">
          <h4 className="text-white text-lg font-semibold">Únete a la comunidad</h4>
          <div className="flex gap-x-6 items-center">
            <Link href="https://www.facebook.com/Tecpoint.Distribucion/">
              <Image
                className="cursor-pointer aspect-square object-contain"
                src="/images/social/facebook.svg"
                alt="Facebook de Tecpoint"
                height={26}
                width={26}
              />
            </Link>

            <Link href="https://www.instagram.com/tecpoint_distribucion/">
              <Image
                className="cursor-pointer aspect-square object-contain"
                src="/images/social/instagram.svg"
                alt="Instagram de Tecpoint"
                height={26}
                width={26}
              />
            </Link>

            <Link href="https://www.tiktok.com/@tecpoint.ws">
              <Image
                className="cursor-pointer aspect-square object-contain"
                src="/images/social/tiktok.svg"
                alt="TikTok de Tecpoint"
                height={30}
                width={30}
              />
            </Link>

            <Link href="https://www.tiktok.com/@tecpoint.ws">
              <Image
                className="cursor-pointer aspect-square object-contain grayscale hover:grayscale-0 transition-all"
                src="/images/social/whatsapp.svg"
                alt="WhatsApp de Tecpoint"
                height={26}
                width={26}
              />
            </Link>

            <Link href="https://linktr.ee/tecpoint.ws">
              <Image
                className="cursor-pointer aspect-auto object-contain grayscale hover:grayscale-0 transition-all"
                src="/images/social/Linktree.svg"
                alt="WhatsApp de Tecpoint"
                width={96}
                height={26}
              />
            </Link>
          </div>
        </div>

        <div className="text-white text-sm leading-relaxed">
          <h4 className="text-lg font-semibold mb-2">Contacto</h4>
          <p>Dirección: San Pedro Sula, Barrio el Benque 9 avenida entre 5 y 6 calle</p>
          <p>Dirección: City Mall S.P.S, segundo nivel frente a tiendas Carrion</p>
          <p>Dirección: Plaza Carolina, Boulevard Mackey, segundo nivel</p>
          <p>Teléfono: +504 9715-7784</p>
          <p>Email: tecpointdistribucion@gmail.com</p>
        </div>
      </section>

      <section className="flex flex-wrap justify-center gap-6 mt-6">
        <Link href="/garantia" className="text-gray-400 hover:text-white text-sm">
          Garantía
        </Link>
        <Link href="/terminos-y-condiciones" className="text-gray-400 hover:text-white text-sm">
          Términos y Condiciones
        </Link>
        <Link href="/preguntas-frecuentes" className="text-gray-400 hover:text-white text-sm">
          Preguntas Frecuentes
        </Link>
        <Link href="/politica-privacidad" className="text-gray-400 hover:text-white text-sm">
          Política de Privacidad
        </Link>
      </section>

      <section className="text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Tecpoint. Todos los derechos reservados.</p>
      </section>
    </footer>
  );
}

export default Footer;