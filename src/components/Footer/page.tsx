import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Tienda", href: "/shop?page=1&brand=&search=" },
  { label: "Categorías", href: "/categories" },
  { label: "Garantía", href: "/garantia" },
  { label: "Preguntas Frecuentes", href: "/preguntas-frecuentes" },
];

const categoryLinks = [
  { label: "Auriculares", href: "/shop?page=1&brand=&search=auriculares" },
  { label: "Audifonos BT", href: "/shop?page=1&brand=&search=audifonos" },
  { label: "Cables", href: "/shop?page=1&brand=&search=cable" },
  { label: "Cargadores", href: "/shop?page=1&brand=&search=cargador" },
  { label: "Cobertores", href: "/shop?page=1&brand=&search=cobertor" },
  { label: "Power Banks", href: "/shop?page=1&brand=&search=power+bank" },
];

const socialLinks = [
  { href: "https://www.facebook.com/Tecpoint.Distribucion/", src: "/images/social/facebook.svg", alt: "Facebook" },
  { href: "https://www.instagram.com/tecpoint_distribucion/", src: "/images/social/instagram.svg", alt: "Instagram" },
  { href: "https://www.tiktok.com/@tecpoint.ws", src: "/images/social/tiktok.svg", alt: "TikTok" },
  { href: "https://wa.me/50497157784", src: "/images/social/whatsapp.svg", alt: "WhatsApp" },
];

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] w-full">

      {/* Newsletter banner */}
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[#CCFD03] text-xs font-bold uppercase tracking-widest mb-1">Newsletter</p>
            <h4 className="text-white text-xl md:text-2xl font-bold tracking-tight">
              Recibe ofertas y novedades
            </h4>
          </div>
          <form
            className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="h-11 w-full sm:w-[300px] bg-white/5 border border-white/10 text-white py-2 px-5 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:border-[#CCFD03] transition-colors"
              placeholder="tucorreo@email.com"
              type="email"
              name="correo"
            />
            <button
              type="submit"
              className="bg-[#CCFD03] text-black font-bold py-2 px-6 h-11 rounded-full hover:bg-white transition-colors text-sm whitespace-nowrap"
            >
              Suscribirse
            </button>
          </form>
        </div>
      </div>

      {/* Cuerpo principal */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Columna 1: Logo + descripción + redes */}
        <div className="flex flex-col gap-6 sm:col-span-2 lg:col-span-1">
          <Image
            src="/logo.png"
            alt="Tecpoint Logo"
            width={140}
            height={40}
            className="object-contain object-left h-9 w-auto"
          />
          <p className="text-gray-400 text-sm leading-relaxed">
            Distribuidores de accesorios tecnológicos de las mejores marcas en Honduras. Al mayor y al detalle.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((s) => (
              <Link
                key={s.alt}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#CCFD03] hover:border-[#CCFD03] transition-all group"
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={16}
                  height={16}
                  className="object-contain group-hover:invert transition-all"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Columna 2: Navegación */}
        <div className="flex flex-col gap-4">
          <h5 className="text-white text-sm font-bold uppercase tracking-widest">Navegación</h5>
          <ul className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:translate-x-0.5 inline-block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Categorías */}
        <div className="flex flex-col gap-4">
          <h5 className="text-white text-sm font-bold uppercase tracking-widest">Categorías</h5>
          <ul className="flex flex-col gap-2.5">
            {categoryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors hover:translate-x-0.5 inline-block"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 4: Contacto */}
        <div className="flex flex-col gap-4">
          <h5 className="text-white text-sm font-bold uppercase tracking-widest">Contacto</h5>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <span className="size-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#CCFD03" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </span>
              <div>
                <p className="text-gray-300 text-sm leading-snug">Barrio Los Andes, San Pedro Sula</p>
                <p className="text-gray-500 text-xs mt-0.5">7 Calle A - 14 Avenida N.O</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="size-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#CCFD03" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </span>
              <div>
                <p className="text-gray-300 text-sm leading-snug">Boulevard Mackey, San Pedro Sula</p>
                <p className="text-gray-500 text-xs">Plaza Carolina, Segundo Nivel</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="size-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#CCFD03" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </span>
              <div>
                <p className="text-gray-300 text-sm leading-snug">Centro Comercial Portal de Viera, Tegucigalpa</p>
                <p className="text-gray-500 text-xs">Tercer Nivel, Km. 3 Carretera al Hatillo</p>
              </div>
            </li>

            <li className="flex items-center gap-3">
              <span className="size-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#CCFD03" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <a href="tel:+50494659287" className="text-gray-400 hover:text-white text-sm transition-colors">
                +504 9465-9287
              </a>
            </li>

            <li className="flex items-center gap-3">
              <span className="size-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#CCFD03" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
              <a href="mailto:tecpointdistribucion@gmail.com" className="text-gray-400 hover:text-white text-sm transition-colors truncate">
                tecpointdistribucion@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Tecpoint Distribución. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terminos-y-condiciones" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/politica-privacidad" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
